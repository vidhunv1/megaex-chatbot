import { User } from 'models'
import * as TelegramBot from 'node-telegram-bot-api'

export const keyboardMainMenu = (
  user: User
): TelegramBot.ReplyKeyboardMarkup => {
  return {
    keyboard: [
      [
        { text: user.t('main-menu.wallet') },
        {
          text: user.t('main-menu.exchange', {
            fiatCurrency: user.currencyCode
          })
        }
      ],
      [
        { text: user.t('main-menu.info') },
        { text: user.t('main-menu.account') }
      ]
    ],
    one_time_keyboard: false,
    resize_keyboard: true
  }
}

export const centerJustify = function(str: string | number, length: number) {
  const char = ' '
  str = str + ''
  return (
    char.repeat((length - str.length) / 2) +
    str +
    char.repeat((length - str.length) / 2)
  )
}
