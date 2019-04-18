import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { AccountState, AccountStateKey } from './AccountState'
import logger from 'modules/Logger'

export function accountParser(
  _msg: TelegramBot.Message,
  _user: User,
  currentState: AccountState
): AccountState | null {
  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case AccountStateKey.start:
      return currentState
    case AccountStateKey.account:
      return null
    default:
      logger.error(
        `Unhandled accountParser: default ${currentState.currentStateKey}`
      )
      return null
  }
}
