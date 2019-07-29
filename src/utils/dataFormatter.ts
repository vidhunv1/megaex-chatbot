import {
  CryptoCurrency,
  FiatCurrency,
  cryptoCurrencyInfo
} from 'constants/currencies'

export const dataFormatter = {
  formatFiatCurrency: (
    amount: number,
    currency?: FiatCurrency,
    locale = 'en-US'
  ) => {
    // TODO: Find all locale for correct groupings.
    const l = currency === FiatCurrency.INR ? 'en-IN' : locale
    return `${amount.toLocaleString(l, {
      currency,
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    })}${currency ? ' ' + currency : ''}`
  },

  formatCryptoCurrency: (
    amount: number,
    currency?: CryptoCurrency,
    _locale = 'en-US'
  ) => {
    const precision = cryptoCurrencyInfo[CryptoCurrency.BTC].precision
    const m = Math.pow(10, precision)
    const safeAmount = parseInt(amount * m + '') / m
    return safeAmount + (currency ? ' ' + currency : '')
  }
}
