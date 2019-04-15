import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import { WALLET_STATE_KEY, WalletState, initialState } from './WalletState'
import { parseCallbackQuery } from 'chats/utils'
import { CallbackTypes, callbackStateMap } from './constants'
import { walletParser } from './walletParser'
import { walletResponder } from './walletResponder'

export const WalletChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
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
    state: WalletState | null
  ) {
    if (callback.data && state) {
      const { type, params } = parseCallbackQuery<CallbackTypes>(callback.data)

      const callbackState = callbackStateMap[type]
      state.currentMessageKey = callbackState
      state[callbackState] = params

      const nextState: WalletState | null = await walletParser(
        msg,
        tUser.id,
        user,
        state
      )

      if (nextState === null) {
        return false
      }

      return await walletResponder(msg, user, nextState)
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: WalletState | null
  ) {
    let currentState = state
    if (msg.text === user.t('main-menu.wallet')) {
      currentState = initialState
    }

    if (currentState && currentState.key === WALLET_STATE_KEY) {
      const nextState: WalletState | null = await walletParser(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return walletResponder(msg, user, nextState)
    } else {
      return false
    }
  }
}
