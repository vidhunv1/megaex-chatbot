import { PaymentMethods } from 'constants/paymentMethods'

export enum AccountHomeStateKey {
  start = 'start',
  account = 'account'
}

export interface AccountHomeState {
  [AccountHomeStateKey.start]?: {
    data: {
      accountId: string
      totalDeals: number
      totalVolume: number
      avgSpeedSec: number
      rating: number
      referralCount: number
      totalEarnings: number
      addedPaymentMethods: PaymentMethods[]
    } | null
  }
}

export enum AccountHomeError {
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND'
}
