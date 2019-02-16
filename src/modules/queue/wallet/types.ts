import { CryptoCurrency } from '../../../constants/currencies'

export enum WalletJobs {
  CREATE_ADDRESS = 'create-address',
  DEPOSIT_ALERT = 'deposit-alert',
  WITHDRAW_FUNDS = 'withdraw-funds',
  GET_TRANSACTION = 'get-transaction', // Verify transactionId after deposit alert

  GENERATED_ADDRESS = 'generated-address',
  WITHDRAWAL_STATUS_ALERT = 'withdrawal-status'
}

export interface WalletJobProducer {
  [WalletJobs.CREATE_ADDRESS]: {
    userId: number // Unique id for assocated used; (User.id model)
    currency: CryptoCurrency
  }
  [WalletJobs.DEPOSIT_ALERT]: {
    currency: CryptoCurrency
    userId: string
    address: string // Deposit address
    transactionHash: string
    confirmations: number
    amount: string
  }
  [WalletJobs.WITHDRAW_FUNDS]: {
    id: number
    userId: string
    currency: CryptoCurrency
    address: string // Withdraw address
    amount: string
  }
  [WalletJobs.GET_TRANSACTION]: {
    currency: CryptoCurrency
    transactionHash: string
  }

  [WalletJobs.GENERATED_ADDRESS]: {
    userId: number // Unique id for assocated used; (User.id model)
    address: string
    currency: CryptoCurrency
  }
  [WalletJobs.WITHDRAWAL_STATUS_ALERT]: {
    id: number
    status: 'completed' | 'error'
    transactionHash: string
  }
}
