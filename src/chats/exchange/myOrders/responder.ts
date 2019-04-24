import { MyOrdersStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { MyOrdersMessage } from './messages'

export const MyOrdersResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<MyOrdersStateKey, () => Promise<boolean>> = {
    [MyOrdersStateKey.cb_myOrders]: async () => {
      return false
    },
    [MyOrdersStateKey.myOrders_show]: async () => {
      await MyOrdersMessage(msg, user).showMyOrdersMessage()
      return true
    }
  }

  return resp[currentState.currentStateKey as MyOrdersStateKey]()
}
