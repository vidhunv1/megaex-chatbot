import { FiatCurrency, CryptoCurrency } from 'constants/currencies'

/*
  '1 INR' -> { 1, FiatCurrency.INR }
  'INR' -> { 0, FiatCurrency.INR }
  '1INR' -> { 1, FiatCurrency.INR }
  '100     btc' -> { 100, CryptoCurrency.BTC }

  If no currency code is available in string, the default currency code will be used

  (100, FiatCurrency.INR) => { 100, FiatCurrency.INR }
*/
export function parseCurrencyAmount(
  amount: string,
  defaultCurrencyCode: FiatCurrency | CryptoCurrency
): {
  currencyCode: FiatCurrency | CryptoCurrency
  currencyKind: 'fiat' | 'crypto' | 'unknown'
  amount: number
} | null {
  const value = parseFloat(amount.replace(/[^\d\.]/g, ''))
  let currency = amount.replace(/[^a-z]/gi, '').toUpperCase()

  if (currency.length === 0) {
    currency = defaultCurrencyCode
  }

  const isFiatCurrency = Object.values(FiatCurrency).some(
    (k: FiatCurrency) => FiatCurrency[k] === currency
  )
  const isCryptoCurrency = Object.values(CryptoCurrency).some(
    (k: CryptoCurrency) => CryptoCurrency[k] === currency
  )

  return {
    currencyCode: currency as FiatCurrency | CryptoCurrency,
    currencyKind: isCryptoCurrency
      ? 'crypto'
      : isFiatCurrency
      ? 'fiat'
      : 'unknown',
    amount: value
  }
  return null
}
