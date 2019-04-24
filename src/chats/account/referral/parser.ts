import { ReferralStateKey } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'

export const ReferralParser: Parser<AccountState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<ReferralStateKey, () => Promise<AccountState | null>> = {
    [ReferralStateKey.cb_referralLink]: async () => {
      const cbState = _.get(
        currentState,
        ReferralStateKey.cb_referralLink,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [ReferralStateKey.cb_referralLink]: {
          ...cbState,
          data: {
            referralLink: getReferralLink(),
            referralCount: getReferralCount(),
            referralFeesPercentage: getReferralFees()
          }
        }
      }
    },

    [ReferralStateKey.referralLink_show]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as ReferralStateKey
  ]()
  const nextStateKey = nextReferralState(updatedState)
  const nextState = updateNextAccountState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextReferralState(
  state: AccountState | null
): AccountStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case ReferralStateKey.cb_referralLink:
      return ReferralStateKey.referralLink_show
    case ReferralStateKey.referralLink_show:
      return null
    default:
      return null
  }
}

const getReferralLink = () => {
  return 'https://t.me/megadealsbot?start=ref-fqwkjqel'
}

const getReferralCount = () => {
  return 0
}

const getReferralFees = () => {
  return 90
}
