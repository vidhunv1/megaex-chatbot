import { AccountHomeStateKey } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'
import { PaymentMethodFields } from '../paymentMethods'
import { PaymentMethods } from 'constants/paymentMethods'

export const AccountHomeParser: Parser<AccountState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<
    AccountHomeStateKey,
    () => Promise<AccountState | null>
  > = {
    [AccountHomeStateKey.account]: async () => {
      return null
    },

    [AccountHomeStateKey.start]: async () => {
      return {
        ...currentState,
        [AccountHomeStateKey.start]: {
          data: {
            accountId: getAccountId(),
            totalDeals: getTotalDeals(),
            totalVolume: getTotalVolume(),
            avgSpeedSec: getAvgSpeed(),
            rating: getRating(),
            referralCount: getReferralCount(),
            totalEarnings: getEarnings(),
            addedPaymentMethods: getAddedPaymentMethods().map(
              (pm) => pm.paymentMethod
            )
          }
        }
      }
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as AccountHomeStateKey
  ]()
  const nextStateKey = nextAccountHomeState(updatedState)
  const nextState = updateNextAccountState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextAccountHomeState(
  state: AccountState | null
): AccountStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case AccountHomeStateKey.start:
      return AccountHomeStateKey.account
    case AccountHomeStateKey.account:
      return null
    default:
      return null
  }
}

const getReferralCount = () => {
  return 0
}

const getAccountId = () => {
  return 'U9SAE8'
}

const getTotalDeals = () => {
  return 100
}

const getTotalVolume = () => {
  return 100
}

const getAvgSpeed = () => {
  return 120
}

const getEarnings = () => {
  return 5
}

const getRating = () => {
  return {
    totalPercentage: 98,
    upVotes: 100,
    downVotes: 3
  }
}

const getAddedPaymentMethods = (id?: number): PaymentMethodFields[] => {
  const pms = [
    {
      id: 1,
      paymentMethod: PaymentMethods.BANK_TRANSFER_INR,
      fields: ['Axis Bank', '10291029120912', 'IOBA000124']
    },
    {
      id: 2,
      paymentMethod: PaymentMethods.PAYTM,
      fields: ['+91 9999999999']
    }
  ]

  if (id) {
    const pm = _.find(pms, { id })
    if (pm) {
      return [pm]
    }
    return []
  }

  return pms
}