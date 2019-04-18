import { ExchangeState, ExchangeStateKey } from './ExchangeState'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'

export function exchangeParser(
  _msg: TelegramBot.Message,
  _user: User,
  currentState: ExchangeState
): ExchangeState | null {
  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case ExchangeStateKey.start:
      return currentState
    default:
      return null
  }
}
