import { Language, LanguageView } from 'constants/languages'
import * as TelegramBot from 'node-telegram-bot-api'
import { FiatCurrency, CurrencySymbol } from 'constants/currencies'

export const languageKeyboard: TelegramBot.KeyboardButton[][] = []
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

export const currencyKeyboard: TelegramBot.KeyboardButton[][] = []
Object.keys(FiatCurrency).forEach((fiatCurrency, index) => {
  if (index % 3 === 0) {
    currencyKeyboard.push([
      { text: getCurrencyView(fiatCurrency as FiatCurrency) }
    ])
  } else {
    currencyKeyboard[currencyKeyboard.length - 1] = [
      ...currencyKeyboard[currencyKeyboard.length - 1],
      { text: getCurrencyView(fiatCurrency as FiatCurrency) }
    ]
  }
})

export function getCurrencyView(currency: FiatCurrency) {
  const currencyCode = CurrencySymbol[currency]
  if (currencyCode) {
    return `${currency} (${currencyCode})`
  }
  return currency
}
