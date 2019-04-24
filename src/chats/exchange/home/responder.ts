import { ExchangeHomeStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { ExchangeHomeMessage } from './messages'

export const ExchangeHomeResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<ExchangeHomeStateKey, () => Promise<boolean>> = {
    [ExchangeHomeStateKey.start]: async () => {
      return false
    },

    [ExchangeHomeStateKey.exchange]: async () => {
      await ExchangeHomeMessage(msg, user).showExchangeHome()
      return true
    }
  }

  return resp[currentState.currentStateKey as ExchangeHomeStateKey]()
}
