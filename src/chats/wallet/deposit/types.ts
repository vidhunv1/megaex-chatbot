import { CryptoCurrency } from 'constants/currencies'

export enum DepositStateKey {
  cb_depositCoin = 'cb_depositCoin',
  depositCoin_show = 'depositCoin_show'
}

export interface DepositState {
  [DepositStateKey.cb_depositCoin]?: {
    currencyCode: CryptoCurrency
  }

  [DepositStateKey.depositCoin_show]?: {
    currencyCode: CryptoCurrency
    address: string
  }
}
