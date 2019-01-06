import Transaction from '../models/transaction'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import TelegramBotApi from './telegram-bot-api'
import Logger from './logger'

export default class NotificationManager {
  static instance: NotificationManager
  private logger!: any
  static NOTIF = {
    NEW_TRANSACTION: 'newTransaction',
    PAYMENT_EXPIRED: 'paymentLinkExpired',
    PAYMENT_DEBIT: 'paymentLinkDebit'
  }

  constructor() {
    if (NotificationManager.instance) return NotificationManager.instance

    this.logger = new Logger().getLogger()
    NotificationManager.instance = this
  }

  async sendNotification(notificationType: string, data: any) {
    const tBot = new TelegramBotApi().getBot()
    let user
    switch (notificationType) {
      case NotificationManager.NOTIF.NEW_TRANSACTION:
        const transaction = await Transaction.findOne({
          where: {
            transactionId: data.transactionId
          }
        })
        if (!transaction) return

        user = await User.findById(transaction.userId, {
          include: [TelegramUser]
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

      case NotificationManager.NOTIF.PAYMENT_EXPIRED:
        user = await User.findById(data.userId, { include: [TelegramUser] })
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

      case NotificationManager.NOTIF.PAYMENT_DEBIT:
        user = await User.findById(data.userId, { include: [TelegramUser] })
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
        this.logger.error('Unknown notification type: ' + notificationType)
    }
  }
}
