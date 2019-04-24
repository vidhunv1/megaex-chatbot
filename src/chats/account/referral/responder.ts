import { ReferralStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { ReferralMessage } from './messages'

export const ReferralResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<ReferralStateKey, () => Promise<boolean>> = {
    [ReferralStateKey.cb_referralLink]: async () => {
      return false
    },

    [ReferralStateKey.referralLink_show]: async () => {
      const data = _.get(
        currentState[ReferralStateKey.cb_referralLink],
        'data',
        null
      )
      if (!data) {
        return false
      }

      const { referralCount, referralLink, referralFeesPercentage } = data
      await ReferralMessage(msg, user).showReferralInfo(
        referralLink,
        referralCount,
        referralFeesPercentage
      )
      return true
    }
  }

  return resp[currentState.currentStateKey as ReferralStateKey]()
}
