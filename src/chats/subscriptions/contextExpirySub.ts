import { CacheKeys } from 'lib/cache-keys'
import { NotificationManager, NotificationType } from 'lib/NotificationManager'
import telegramHook from 'modules/TelegramHook'
import logger from 'modules/Logger'
import { RedisAPI } from 'modules/Cache'
import { keyboardMenu } from 'chats/common'

import { TelegramAccount, User, Transfer } from 'models'

export const expirySubscription = async (
  msg: string,
  cacheClient: RedisAPI
) => {
  const notificationManager = new NotificationManager()
  const tBot = telegramHook.getWebhook

  if (
    CacheKeys.isKey(msg, new CacheKeys(1).getKeys().messageCounter.shadowKey)
  ) {
    const telegramId = CacheKeys.getIdFromKey(msg)
    const rKeys = new CacheKeys(telegramId).getKeys()
    const cacheCount: number = parseInt(
      (await cacheClient.getAsync(rKeys.messageCounter.key)) || '0'
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
      throw e
    }
  } else if (CacheKeys.isKey(msg, new CacheKeys(1).getKeys().tContext.key)) {
    const telegramId = CacheKeys.getIdFromKey(msg)
    const tUser: TelegramAccount | null = await TelegramAccount.findOne({
      where: { id: telegramId },
      include: [{ model: User }]
    })
    if (tUser) {
      tBot.sendMessage(telegramId, tUser.user.t('context_action_expired'), {
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
