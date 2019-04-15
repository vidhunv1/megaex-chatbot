import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import { ACCOUNT_STATE_KEY, AccountState, initialState } from './AccountState'
import { accountParser } from './accountParser'
import { accountResponder } from './accountResponder'

export const AccountChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount
  ) {
    return false
  },

  async handleCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: AccountState | null
  ) {
    let currentState = state
    if (msg.text === user.t('main-menu.account')) {
      currentState = initialState
    }
    if (currentState && currentState.key === ACCOUNT_STATE_KEY) {
      const nextState: AccountState | null = await accountParser(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return accountResponder(msg, user, nextState)
    } else {
      return false
    }
  }
}
