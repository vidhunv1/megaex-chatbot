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
    },
    [MyOrdersStateKey.cb_deleteOrder]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_editAmount]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_editOrder]: async () => {
      return true
    },
    [MyOrdersStateKey.cb_editPaymentMethod]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_editRate]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_editTerms]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_showOrder_back]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_toggleActive]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as MyOrdersStateKey]()
}
