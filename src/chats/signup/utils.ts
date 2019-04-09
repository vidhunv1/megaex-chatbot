import { Language, LanguageView } from 'constants/languages'
import * as TelegramBot from 'node-telegram-bot-api'
import { FiatCurrency } from 'constants/currencies'

const languageKeyboard: TelegramBot.KeyboardButton[][] = []
Object.keys(Language).forEach((lang, index) => {
  if (index % 2 === 0) {
    languageKeyboard.push([{ text: LanguageView[lang as Language] }])
  } else {
    languageKeyboard[languageKeyboard.length - 1] = [
      ...languageKeyboard[languageKeyboard.length - 1],
      { text: LanguageView[lang as Language] }
    ]
  }
})

const currencyKeyboard: TelegramBot.KeyboardButton[][] = []
Object.keys(FiatCurrency).forEach((fiatCurrency, index) => {
  if (index % 4 === 0) {
    currencyKeyboard.push([{ text: fiatCurrency }])
  } else {
    currencyKeyboard[currencyKeyboard.length - 1] = [
      ...currencyKeyboard[currencyKeyboard.length - 1],
      { text: fiatCurrency }
    ]
  }
})

export { languageKeyboard, currencyKeyboard }
