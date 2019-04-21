import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import {
  ACCOUNT_STATE_LABEL,
  AccountState,
  initialState,
  AccountStateKey,
  nextAccountState
} from './AccountState'
import { accountParser } from './accountParser'
import { accountResponder } from './accountResponder'
import { parseCallbackQuery } from 'chats/utils'
import * as _ from 'lodash'

export const AccountChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
    _command: BotCommand,
    _user: User,
    _tUser: TelegramAccount
  ) {
    return false
  },

  async handleCallback(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery,
    state: AccountState | null
  ) {
    if (callback.data) {
      const { type, params } = parseCallbackQuery(callback.data)
      if (AccountStateKey[type as any] == null) {
        return false
      }
      const callbackName = (type as any) as AccountStateKey
      if (_.get(state, 'key', null) != ACCOUNT_STATE_LABEL) {
        // Callback types allowed to answer indirectly
        if (
          [
            AccountStateKey.cb_paymentMethods,
            AccountStateKey.cb_referralLink,
            AccountStateKey.cb_editPaymentMethods,
            AccountStateKey.cb_addPaymentMethod
          ].includes(callbackName)
        ) {
          state = _.clone(initialState)
        }
      }

      if (!state) {
        return false
      }

      state.currentStateKey = callbackName
      // @ts-ignore
      state[callbackName] = params

      const updatedState: AccountState | null = accountParser(msg, user, state)
      const nextState = await nextAccountState(updatedState, tUser.id)
      if (nextState == null) {
        return false
      }

      return accountResponder(msg, user, nextState)
    }
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

    if (currentState && currentState.key === ACCOUNT_STATE_LABEL) {
      const updatedState: AccountState | null = await accountParser(
        msg,
        user,
        currentState
      )

      const nextState: AccountState | null = await nextAccountState(
        updatedState,
        tUser.id
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
