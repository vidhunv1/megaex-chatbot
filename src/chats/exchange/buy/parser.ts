import { BuyStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'

export const BuyParser: Parser<ExchangeState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<BuyStateKey, () => Promise<ExchangeState | null>> = {
    [BuyStateKey.cb_buy]: async () => {
      return currentState
    },
    [BuyStateKey.buy_show]: async () => {
      return currentState
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as BuyStateKey
  ]()
  const nextStateKey = nextBuyState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

export function nextBuyState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case BuyStateKey.cb_buy:
      return BuyStateKey.buy_show
    case BuyStateKey.buy_show:
      return null
    default:
      return null
  }
}
