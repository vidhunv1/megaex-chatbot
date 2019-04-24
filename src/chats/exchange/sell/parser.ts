import { SellStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'

export const SellParser: Parser<ExchangeState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<SellStateKey, () => Promise<ExchangeState | null>> = {
    [SellStateKey.cb_sell]: async () => {
      return currentState
    },
    [SellStateKey.sell_show]: async () => {
      return currentState
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as SellStateKey
  ]()
  const nextStateKey = nextSellState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextSellState(state: ExchangeState | null): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case SellStateKey.cb_sell:
      return SellStateKey.sell_show
    case SellStateKey.sell_show:
      return null
    default:
      return null
  }
}
