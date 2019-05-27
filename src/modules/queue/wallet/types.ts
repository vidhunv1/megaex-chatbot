import { CryptoCurrency } from 'constants/currencies'

export const WALLET_NAMESPACE = 'wallet'

export enum WalletQueueName {
  NEW_DEPOSIT = 'NEW-DEPOSIT',
  GEN_ADDRESS = 'GEN_ADDRESS',
  TEST = 'TEST'
}

export interface WalletJob {
  [WalletQueueName.NEW_DEPOSIT]: {
    txid: string
    currency: CryptoCurrency
  }
  [WalletQueueName.GEN_ADDRESS]: {
    currency: CryptoCurrency
    userId: string
  }
}
