import { AccountHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import { CryptoCurrency } from 'constants/currencies'
import { AccountHomeMessage } from './messages'
import * as _ from 'lodash'
import { PaymentMethod, Trade, Referral, Transaction, User } from 'models'
import { PaymentMethodFields } from 'models'

const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

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
      const userStats = await getUserStats(user.id, CURRENT_CRYPTOCURRENCY)
      await AccountHomeMessage(msg, user).showAccount(
        user.accountId,
        userStats.dealCount,
        userStats.volume,
        CryptoCurrency.BTC,
        userStats.rating.toFixed(1),
        await getReferralCount(user.id),
        await getEarnings(user.id, CURRENT_CRYPTOCURRENCY),
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
        const user = await User.findOne({
          where: {
            accountId
          }
        })
        if (!user) {
          return false
        }

        const userReviews = await getUserReviews(user.id)
        const cursor = parseInt(stateData.cursor + '')

        if (userReviews.length > 0) {
          const review = userReviews[stateData.cursor]
          await AccountHomeMessage(msg, user).showReview(
            cursor,
            userReviews.length,
            accountId,
            review.firstName,
            review.reviews,
            review.rating,
            review.cryptoAmount,
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
    },

    [AccountHomeStateKey.cb_sendMessage]: async () => {
      return false
    },

    [AccountHomeStateKey.sendMessage]: async () => {
      await AccountHomeMessage(msg, user).inputSendMessage()
      return true
    },

    [AccountHomeStateKey.messageSent]: async () => {
      const sentMessage = _.get(
        state[AccountHomeStateKey.sendMessage],
        'sentMessage',
        null
      )
      await AccountHomeMessage(msg, user).messageSent(sentMessage)
      return true
    }
  }

  return resp[state.currentStateKey as AccountHomeStateKey]()
}

async function getUserReviews(userId: number) {
  return await Trade.getUserReviews(userId)
}

const getReferralCount = async (userId: number) => {
  const referredUsers = await Referral.getReferredUsers(userId)
  return referredUsers ? referredUsers.length : 0
}

const getEarnings = async (
  userId: number,
  cryptoCurrencyCode: CryptoCurrency
) => {
  return await Transaction.getEarnedComission(userId, cryptoCurrencyCode)
}

const getUserStats = async (
  userId: number,
  cryptoCurrencyCode: CryptoCurrency
) => {
  return await Trade.getUserStats(userId, cryptoCurrencyCode)
}

async function getSavedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}
