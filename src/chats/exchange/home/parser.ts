import { ExchangeHomeStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'

export const ExchangeParser: Parser<ExchangeState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<
    ExchangeHomeStateKey,
    () => Promise<ExchangeState | null>
  > = {
    [ExchangeHomeStateKey.start]: async () => {
      return currentState
    },
    [ExchangeHomeStateKey.exchange]: async () => {
      return currentState
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as ExchangeHomeStateKey
  ]()
  const nextStateKey = nextExchangeHomeState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

export function nextExchangeHomeState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case ExchangeHomeStateKey.start:
      return ExchangeHomeStateKey.exchange
    case ExchangeHomeStateKey.exchange:
      return null
    default:
      return null
  }
}
