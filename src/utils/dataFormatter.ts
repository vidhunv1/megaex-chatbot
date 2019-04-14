import { CryptoCurrency, FiatCurrency } from 'constants/currencies'

export const dataFormatter = {
  formatFiatCurrency: (
    amount: number,
    currency?: FiatCurrency,
    locale = 'en-US'
  ) => {
    // TODO: Find all locale for correct groupings.
    const l = currency === FiatCurrency.INR ? 'en-IN' : locale
    return amount.toLocaleString(l, {
      currency,
      currencyDisplay: 'symbol',
      style: 'currency',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    })
  },

  formatCryptoCurrency: (
    amount: number,
    currency?: CryptoCurrency,
    locale = 'en-US'
  ) => {
    return amount.toLocaleString(locale, {
      currency,
      currencyDisplay: 'name',
      style: 'currency',
      minimumFractionDigits: 7,
      maximumFractionDigits: 7,
      useGrouping: false
    })
  }
}
