import { User, Transaction, TelegramAccount } from '../models'
import telegramHook from '../modules/TelegramHook'
import logger from '../modules/Logger'

export enum NotificationType {
  NEW_TRANSACTION,
  PAYMENT_EXPIRED,
  PAYMENT_DEBIT
}

export class NotificationManager {
  static instance: NotificationManager

  constructor() {
    if (NotificationManager.instance) return NotificationManager.instance

    NotificationManager.instance = this
  }

  async sendNotification(notificationType: NotificationType, data: any) {
    const tBot = telegramHook.getWebhook
    let user
    switch (notificationType) {
      case NotificationType.NEW_TRANSACTION:
        const transaction = await Transaction.findOne({
          where: {
            transactionId: data.transactionId
          }
        })
        if (!transaction) return

        user = await User.findById(transaction.userId, {
          include: [TelegramAccount]
        })
        if (!user) return

        let message
        if (transaction.transactionType === 'receive') {
          message = user.__(
            'new_transaction_credit %s %s %s %s',
            user.__(transaction.currencyCode),
            transaction.amount,
            transaction.currencyCode,
            transaction.transactionId
          )
        } else {
          message =
            'Your send request ' +
            transaction.amount +
            ' ' +
            transaction.currencyCode +
            ' was successful. Txid: ' +
            transaction.transactionId
        }
        await tBot.sendMessage(user.telegramUser.id, message, {
          parse_mode: 'Markdown'
        })
        break

      case NotificationType.PAYMENT_EXPIRED:
        user = await User.findById(data.userId, { include: [TelegramAccount] })
        if (!user) return

        await tBot.sendMessage(
          user.telegramUser.id,
          user.__(
            'notify_expired_payment %s %s',
            data.amount,
            data.currencyCode
          ),
          { parse_mode: 'Markdown' }
        )
        break

      case NotificationType.PAYMENT_DEBIT:
        user = await User.findById(data.userId, { include: [TelegramAccount] })
        if (!user) return

        await tBot.sendMessage(
          user.telegramUser.id,
          user.__(
            'payment_claimed_debit %s %s %s',
            data.amount,
            data.currencyCode,
            data.telegramUsername
              ? '@' + data.telegramUsername
              : data.telegramName
          ),
          { parse_mode: 'Markdown' }
        )
        break

      default:
        logger.error('Unknown notification type: ' + notificationType)
    }
  }
}
