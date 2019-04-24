import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export const SellMessage = (msg: TelegramBot.Message, user: User) => ({
  async showSellMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:sell.show-orders`),
      {
        parse_mode: 'Markdown'
      }
    )
  }
})
