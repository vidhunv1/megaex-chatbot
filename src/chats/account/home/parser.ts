import { AccountHomeStateKey } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'

export const AccountHomeParser: Parser<AccountState> = async (
  _msg,
  _user,
  tUser,
  state
) => {
  const parser: Record<
    AccountHomeStateKey,
    () => Promise<AccountState | null>
  > = {
    [AccountHomeStateKey.account]: async () => {
      return null
    },

    [AccountHomeStateKey.start]: async () => {
      return state
    },

    [AccountHomeStateKey.cb_showReviews]: async () => {
      return {
        ...state,
        [AccountHomeStateKey.showReviews]: {
          data: {
            shouldEdit: false,
            cursor: 0
          }
        }
      }
    },

    [AccountHomeStateKey.showReviews]: async () => {
      return null
    },

    [AccountHomeStateKey.cb_reviewShowMore]: async () => {
      const cursor = _.get(
        state[AccountHomeStateKey.cb_reviewShowMore],
        'cursor',
        0
      )
      return {
        ...state,
        [AccountHomeStateKey.showReviews]: {
          data: {
            shouldEdit: true,
            cursor
          }
        }
      }
    }
  }

  const updatedState = await parser[
    state.currentStateKey as AccountHomeStateKey
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
    case AccountHomeStateKey.cb_showReviews:
      return AccountHomeStateKey.showReviews
    case AccountHomeStateKey.cb_reviewShowMore:
      return AccountHomeStateKey.showReviews
    default:
      return null
  }
}
