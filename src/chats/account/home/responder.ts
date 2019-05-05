import { AccountHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import { CryptoCurrency } from 'constants/currencies'
import { AccountHomeMessage } from './messages'
import * as _ from 'lodash'

export const AccountHomeResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<AccountHomeStateKey, () => Promise<boolean>> = {
    [AccountHomeStateKey.start]: async () => {
      return false
    },

    [AccountHomeStateKey.account]: async () => {
      const data = _.get(currentState[AccountHomeStateKey.start], 'data', null)
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
    }
  }

  return resp[currentState.currentStateKey as AccountHomeStateKey]()
}
