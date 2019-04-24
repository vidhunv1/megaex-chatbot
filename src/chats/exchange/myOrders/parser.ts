import { MyOrdersStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'

export const MyOrdersParser: Parser<ExchangeState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<
    MyOrdersStateKey,
    () => Promise<ExchangeState | null>
  > = {
    [MyOrdersStateKey.cb_myOrders]: async () => {
      return currentState
    },
    [MyOrdersStateKey.myOrders_show]: async () => {
      return currentState
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as MyOrdersStateKey
  ]()
  const nextStateKey = nextMyOrdersState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextMyOrdersState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case MyOrdersStateKey.cb_myOrders:
      return MyOrdersStateKey.myOrders_show
    case MyOrdersStateKey.myOrders_show:
      return null
    default:
      return null
  }
}
