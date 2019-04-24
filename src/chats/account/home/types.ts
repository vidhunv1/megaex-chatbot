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
      rating: {
        totalPercentage: number
        upVotes: number
        downVotes: number
      }
      referralCount: number
      totalEarnings: number
      addedPaymentMethods: PaymentMethods[]
    } | null
  }
}
