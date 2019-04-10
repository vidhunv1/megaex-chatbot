import { User } from 'models'
import * as TelegramBot from 'node-telegram-bot-api'

export const keyboardMenu = (user: User): TelegramBot.KeyboardButton[][] => {
  console.log(`USER CURRENCY CODE: ${user.currencyCode}`)
  return [
    [
      {
        text: user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
      }
    ],
    [
      { text: user.t('main-menu.wallet') },
      { text: user.t('main-menu.account') }
    ]
  ]
}
