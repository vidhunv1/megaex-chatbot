import { CryptoCurrency } from 'constants/currencies'
import { CallbackDefaults } from 'chats/types'

export enum DepositStateKey {
  cb_depositCoin = 'cb_depositCoin',
  depositCoin_show = 'depositCoin_show'
}

export interface DepositState {
  [DepositStateKey.cb_depositCoin]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults

  [DepositStateKey.depositCoin_show]?: {
    currencyCode: CryptoCurrency
    address: string
  }
}
