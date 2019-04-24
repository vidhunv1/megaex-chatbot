import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export const CreateOrderMessage = (msg: TelegramBot.Message, user: User) => ({
  async showCreateOrderMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.show`),
      {
        parse_mode: 'Markdown'
      }
    )
  }
})
