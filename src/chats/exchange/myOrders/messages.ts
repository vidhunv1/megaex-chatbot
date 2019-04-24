import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export const MyOrdersMessage = (msg: TelegramBot.Message, user: User) => ({
  async showMyOrdersMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.show-orders`),
      {
        parse_mode: 'Markdown'
      }
    )
  }
})
