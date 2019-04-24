import { CreateOrderStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'

export const CreateOrderParser: Parser<ExchangeState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<
    CreateOrderStateKey,
    () => Promise<ExchangeState | null>
  > = {
    [CreateOrderStateKey.cb_createOrder]: async () => {
      return currentState
    },
    [CreateOrderStateKey.createOrder_show]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as CreateOrderStateKey
  ]()
  const nextStateKey = nextCreateOrderState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextCreateOrderState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case CreateOrderStateKey.cb_createOrder:
      return CreateOrderStateKey.createOrder_show
    case CreateOrderStateKey.createOrder_show:
      return null
    default:
      return null
  }
}
