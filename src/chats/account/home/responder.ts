import { AccountHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import { CryptoCurrency } from 'constants/currencies'
import { AccountHomeMessage } from './messages'
import * as _ from 'lodash'

export const AccountHomeResponder: Responder<AccountState> = (
  msg,
  user,
  state
) => {
  const resp: Record<AccountHomeStateKey, () => Promise<boolean>> = {
    [AccountHomeStateKey.start]: async () => {
      return false
    },

    [AccountHomeStateKey.account]: async () => {
      const data = _.get(state[AccountHomeStateKey.start], 'data', null)
      if (!data) {
        return false
      }

      const {
        accountId,
        totalDeals,
        totalEarnings,
        totalVolume,
        avgSpeedSec,
        rating,
        referralCount,
        addedPaymentMethods
      } = data
      await AccountHomeMessage(msg, user).showAccount(
        accountId,
        totalDeals,
        totalVolume,
        CryptoCurrency.BTC,
        avgSpeedSec,
        rating,
        referralCount,
        totalEarnings,
        addedPaymentMethods
      )
      return true
    },

    [AccountHomeStateKey.cb_showReviews]: async () => {
      return false
    },

    [AccountHomeStateKey.showReviews]: async () => {
      const accountId = _.get(
        state[AccountHomeStateKey.cb_showReviews],
        'accountId',
        null
      )
      const stateData = _.get(
        state[AccountHomeStateKey.showReviews],
        'data',
        null
      )

      if (accountId && stateData) {
        const userReviews = await getUserReviews(accountId)
        const cursor = parseInt(stateData.cursor + '')
        const review = userReviews[stateData.cursor]
        await AccountHomeMessage(msg, user).showReview(
          cursor,
          userReviews.length,
          accountId,
          review.reviewerName,
          review.review,
          review.isUpvote,
          review.dealVolume,
          review.cryptoCurrencyCode,
          stateData.shouldEdit
        )
      }
      return true
    },

    [AccountHomeStateKey.cb_reviewShowMore]: async () => {
      return false
    }
  }

  return resp[state.currentStateKey as AccountHomeStateKey]()
}

interface UserReview {
  reviewerName: string
  review: string
  isUpvote: boolean
  dealVolume: number
  cryptoCurrencyCode: CryptoCurrency
}

async function getUserReviews(_userId: string): Promise<UserReview[]> {
  return [
    {
      reviewerName: 'Vitalik buterin',
      review: 'Best seller - highly recommened',
      isUpvote: true,
      dealVolume: 0.3,
      cryptoCurrencyCode: CryptoCurrency.BTC
    },
    {
      reviewerName: 'buterin',
      review: 'Best sadd seller - highly recommened',
      isUpvote: false,
      dealVolume: 0.3,
      cryptoCurrencyCode: CryptoCurrency.BTC
    },
    {
      reviewerName: 'Max',
      review: 'Worst seller - highly recommened',
      isUpvote: false,
      dealVolume: 0.3,
      cryptoCurrencyCode: CryptoCurrency.BTC
    }
  ]
}
