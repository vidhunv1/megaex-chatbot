import { CryptoCurrency, FiatCurrency } from 'constants/currencies'

export enum WalletHomeStateKey {
  start = 'start',
  wallet = 'wallet'
}

export interface WalletHomeState {
  [WalletHomeStateKey.start]?: {
    data: {
      cryptoCurrencyCode: CryptoCurrency
      cryptoBalance: number
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
      blockedBalance: number
      earnings: number
      referralCount: number
    } | null
  }
}
