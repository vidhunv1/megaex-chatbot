import { PaymentMethods } from 'constants/paymentMethods'

export enum AccountHomeStateKey {
  start = 'start',
  account = 'account',

  cb_showReviews = 'cb_showReviews',
  showReviews = 'showReviews',
  cb_reviewShowMore = 'cb_reviewShowMore'
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

  [AccountHomeStateKey.cb_showReviews]?: {
    accountId: string
  }

  [AccountHomeStateKey.showReviews]?: {
    data: {
      shouldEdit: boolean
      cursor: number
    }
  }

  [AccountHomeStateKey.cb_reviewShowMore]?: {
    cursor: number
  }
}

export enum AccountHomeError {
  ACCOUNT_NOT_FOUND = 'ACCOUNT_NOT_FOUND'
}
