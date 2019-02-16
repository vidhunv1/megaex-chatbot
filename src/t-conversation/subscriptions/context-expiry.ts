import { CacheKeys } from '../../cache-keys'
import { NotificationManager, NotificationType } from '../../lib/notification-manager'
import telegramHook from '../../modules/telegram-hook'
import logger from '../../modules/logger'
import cacheConnection from '../../modules/cache'
import { keyboardMenu } from '../../t-conversation/defaults'

import { TelegramAccount, User, Transfer } from '../../models'

export const expirySubscription = async (msg: string) => {
  const cacheClient = await cacheConnection.getCacheClient()
  const notificationManager = new NotificationManager()
  const tBot = telegramHook.getBot()

  if (
    CacheKeys.isKey(msg, new CacheKeys(1).getKeys().messageCounter.shadowKey)
  ) {
    const telegramId = CacheKeys.getIdFromKey(msg)
    const rKeys = new CacheKeys(telegramId).getKeys()
    const cacheCount: number = parseInt(
      await cacheClient.getAsync(rKeys.messageCounter.key)
    )
    const tUser = await TelegramAccount.findById(telegramId, {
      include: [{ model: User }]
    })
    if (tUser) {
      if (cacheCount > 0) {
        tUser.user.updateAttributes({
          messageCount: cacheCount + tUser.user.messageCount
        })
      }
    }
  } else if (
    CacheKeys.isKey(
      msg,
      new CacheKeys(1).getKeys().paymentExpiryTimer.shadowKey
    )
  ) {
    // delete expired payment and notify
    const paymentId: number = parseInt(CacheKeys.getIdFromKey(msg))
    try {
      const payment = await Transfer.deletePaymentIfExpired(paymentId)
      if (payment) {
        await notificationManager.sendNotification(
          NotificationType.PAYMENT_EXPIRED,
          {
            currencyCode: payment.currencyCode,
            amount: payment.amount,
            userId: payment.userId
          }
        )
      }
    } catch (e) {
      logger.error(
        'Error occurred in deleting expired payment: ' +
          paymentId +
          ', ' +
          JSON.stringify(e)
      )
    }
  } else if (CacheKeys.isKey(msg, new CacheKeys(1).getKeys().tContext.key)) {
    const telegramId = CacheKeys.getIdFromKey(msg)
    const tUser: TelegramAccount | null = await TelegramAccount.findOne({
      where: { id: telegramId },
      include: [{ model: User }]
    })
    if (tUser) {
      tBot.sendMessage(telegramId, tUser.user.__('context_action_expired'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(tUser.user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
    }
  }
}
