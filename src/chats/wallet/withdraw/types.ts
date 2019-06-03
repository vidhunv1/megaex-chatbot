import { CryptoCurrency, FiatCurrency } from 'constants/currencies'

export enum WithdrawStateKey {
  cb_withdrawCoin = 'cb_withdrawCoin',
  withdrawCoin_amount = 'withdrawCoin_amount',
  withdrawCoin_address = 'withdrawCoin_address',
  withdrawCoin_confirm = 'withdrawCoin_confirm',
  withdrawCoin_show = 'withdrawCoin_show',
  withdrawCoin_error = 'withdrawCoin_error'
}

export enum WithdrawCoinError {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  CREATE_ERROR = 'CREATE_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  LESS_THAN_MIN_AMOUNT = 'LESS_THAN_MIN_AMOUNT'
}

export interface WithdrawState {
  // withdraw
  [WithdrawStateKey.cb_withdrawCoin]?: {
    currencyCode: CryptoCurrency
    data: {
      cryptoBalance: number
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
    } | null
  }
  [WithdrawStateKey.withdrawCoin_amount]?: {
    data: {
      cryptoCurrencyAmount: number
      cryptoCurrency: CryptoCurrency
      fiatValue: number
      fiatCurrency: FiatCurrency
    } | null
    error:
      | WithdrawCoinError.INSUFFICIENT_BALANCE
      | WithdrawCoinError.INVALID_AMOUNT
      | WithdrawCoinError.LESS_THAN_MIN_AMOUNT
      | null
  }
  [WithdrawStateKey.withdrawCoin_address]?: {
    data: {
      address: string
    } | null
    error: WithdrawCoinError.INVALID_ADDRESS | null
  }
  [WithdrawStateKey.withdrawCoin_confirm]?: {
    error: WithdrawCoinError.CREATE_ERROR | null
  }
}
