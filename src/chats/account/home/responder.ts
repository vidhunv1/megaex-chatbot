import { AccountHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import { CryptoCurrency } from 'constants/currencies'
import { AccountHomeMessage } from './messages'
import * as _ from 'lodash'
import { logger } from 'modules'
import { PaymentMethod } from 'models'
import { PaymentMethodFields } from 'models'

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
      await AccountHomeMessage(msg, user).showAccount(
        user.accountId,
        getTotalDeals(),
        getTotalVolume(),
        CryptoCurrency.BTC,
        getAvgSpeed(),
        getRating(),
        getReferralCount(),
        getEarnings(),
        await getSavedPaymentMethods(user.id)
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

        if (userReviews.length > 0) {
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
        } else {
          await AccountHomeMessage(msg, user).noReviewsAvailable()
        }
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
  logger.error('TODO: account/responder getUserRevews')
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

const getReferralCount = () => {
  logger.error('TODO: account/responder Implement referral count')
  return 0
}

const getTotalDeals = () => {
  logger.error('TODO: account/responder Implement getTotalDeals')
  return 100
}

const getTotalVolume = () => {
  logger.error('TODO: account/responder Implement getTotalVolume')
  return 100
}

const getAvgSpeed = () => {
  logger.error('TODO: account/responder Implement getAvgSpeed')
  return 120
}

const getEarnings = () => {
  logger.error('TODO: account/responder Implement getEarnings')
  return 5
}

const getRating = () => {
  logger.error('TODO: account/responder Implement getRating')
  return 4.7
}

async function getSavedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}
