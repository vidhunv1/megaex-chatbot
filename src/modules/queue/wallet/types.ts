import { CryptoCurrency } from '../../../constants/currencies'

export enum WalletJobs {
  GENERATE_NEW_ADDRESS = 'GENERATE_NEW_ADDRESS',
  DEPOSIT_ALERT = 'DEPOSIT_ALERT',
  WITHDRAW_FUNDS = 'WITHDRAW_FUNDS'
}

export interface WalletJobProducer {
  [WalletJobs.GENERATE_NEW_ADDRESS]: {
    userId: number // Unique id for assocated used; (User.id model)
    currency: CryptoCurrency
  }
  [WalletJobs.DEPOSIT_ALERT]: {
    txId: string
    confirmations: number
  }
  [WalletJobs.WITHDRAW_FUNDS]: {
    id: number
    userId: string
    currency: CryptoCurrency
    address: string // Withdraw address
    amount: string
  }
}
