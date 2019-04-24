import { CreateOrderStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { CreateOrderMessage } from './messages'

export const CreateOrderResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<CreateOrderStateKey, () => Promise<boolean>> = {
    [CreateOrderStateKey.cb_createOrder]: async () => {
      return false
    },
    [CreateOrderStateKey.createOrder_show]: async () => {
      await CreateOrderMessage(msg, user).showCreateOrderMessage()
      return true
    }
  }

  return resp[currentState.currentStateKey as CreateOrderStateKey]()
}
