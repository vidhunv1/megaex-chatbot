import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  WALLET_STATE_LABEL,
  WalletState,
  initialState,
  WalletStateKey,
  nextWalletState
} from './WalletState'
import { parseCallbackQuery } from 'chats/utils'
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
      const { type, params } = parseCallbackQuery(callback.data)

      if (WalletStateKey[type as any] == null) {
        return false
      }

      const callbackName = (type as any) as WalletStateKey

      if (state.key != WALLET_STATE_LABEL) {
        // Callback types allowed to answer indirectly
        if (
          [
            WalletStateKey.sendCoin,
            WalletStateKey.depositCoin,
            WalletStateKey.withdrawCoin
          ].includes(callbackName)
        ) {
          state = initialState
        }
      }

      state.currentStateKey = callbackName
      // @ts-ignore
      state[callbackName] = params
      const updatedState: WalletState | null = walletParser(msg, user, state)
      const nextState = await nextWalletState(updatedState, tUser.id)
      if (nextState == null) {
        return false
      }

      return walletResponder(msg, user, nextState)
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

    if (currentState && currentState.key === WALLET_STATE_LABEL) {
      const updatedState: WalletState | null = walletParser(
        msg,
        user,
        currentState
      )

      const nextState: WalletState | null = await nextWalletState(
        updatedState,
        tUser.id
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
