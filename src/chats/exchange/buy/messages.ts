import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export const BuyMessage = (msg: TelegramBot.Message, user: User) => ({
  async showBuyMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:buy.show-orders`),
      {
        parse_mode: 'Markdown'
      }
    )
  }
})
