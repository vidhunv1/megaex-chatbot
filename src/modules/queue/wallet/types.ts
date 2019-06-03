import { CryptoCurrency } from 'constants/currencies'

export const WALLET_NAMESPACE = 'wallet'

export enum WalletQueueName {
  NEW_DEPOSIT = 'NEW_DEPOSIT',
  GEN_ADDRESS = 'GEN_ADDRESS',
  COMPLETE_WITHDRAWAL = 'COMPLETE_WITHDRAWAL'
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
  [WalletQueueName.COMPLETE_WITHDRAWAL]: {
    withdrawalId: number
    txid: string
  }
}
