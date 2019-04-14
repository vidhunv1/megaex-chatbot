import { User } from 'models'
import * as TelegramBot from 'node-telegram-bot-api'

export const defaultKeyboardMenu = (
  user: User
): TelegramBot.ReplyKeyboardMarkup => {
  return {
    keyboard: [
      [
        {
          text: user.t('main-menu.exchange', {
            fiatCurrency: user.currencyCode
          })
        }
      ],
      [
        { text: user.t('main-menu.wallet') },
        { text: user.t('main-menu.account') }
      ]
    ],
    one_time_keyboard: true,
    resize_keyboard: true
  }
}
