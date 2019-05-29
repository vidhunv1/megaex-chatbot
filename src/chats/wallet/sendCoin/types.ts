import { CryptoCurrency, FiatCurrency } from 'constants/currencies'

export enum SendCoinStateKey {
  cb_sendCoin = 'cb_sendCoin',
  sendCoin_amount = 'sendCoin_amount',
  sendCoin_confirm = 'sendCoin_confirm',
  sendCoin_show = 'sendCoin_show',
  sendCoin_error = 'sendCoin_error'
}

export enum SendCoinError {
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  CREATE_PAYMENT_ERROR = 'CREATE_PAYMENT_ERROR'
}

export interface SendCoinState {
  // Send coin
  [SendCoinStateKey.cb_sendCoin]?: {
    currencyCode: CryptoCurrency
    data: {
      cryptoBalance: number
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
    } | null
  }
  [SendCoinStateKey.sendCoin_amount]?: {
    data: {
      cryptoCurrencyAmount: number
      cryptoCurrency: CryptoCurrency
      fiatValue: number
      fiatCurrency: FiatCurrency
    } | null
    error:
      | SendCoinError.INSUFFICIENT_BALANCE
      | SendCoinError.INVALID_AMOUNT
      | null
  }
  [SendCoinStateKey.sendCoin_confirm]?: {
    data: {
      paymentLink: string
      expiryTimeS: number
    } | null
    error: SendCoinError.CREATE_PAYMENT_ERROR | null
  }
}
