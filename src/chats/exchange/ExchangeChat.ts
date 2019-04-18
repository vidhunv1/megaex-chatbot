import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  EXCHANGE_STATE_LABEL,
  ExchangeState,
  initialState,
  nextExchangeState,
  ExchangeStateKey
} from './ExchangeState'
import { exchangeParser } from './exchangeParser'
import { exchangeResponder } from './exchangeResponder'
import { parseCallbackQuery } from 'chats/utils'
import * as _ from 'lodash'

export const ExchangeChat: ChatHandler = {
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
    state: ExchangeState | null
  ) {
    if (callback.data) {
      const { type, params } = parseCallbackQuery(callback.data)
      if (ExchangeStateKey[type as any] == null) {
        return false
      }
      const callbackName = (type as any) as ExchangeStateKey
      if (_.get(state, 'key', null) != EXCHANGE_STATE_LABEL) {
        // Callback types allowed to answer indirectly
        if (
          [
            ExchangeStateKey.cb_buy,
            ExchangeStateKey.cb_sell,
            ExchangeStateKey.cb_myOrders,
            ExchangeStateKey.cb_createOrder
          ].includes(callbackName)
        ) {
          state = initialState
        }
      }

      if (!state) {
        return false
      }

      state.currentStateKey = callbackName
      // @ts-ignore
      state[callbackName] = params

      const updatedState: ExchangeState | null = exchangeParser(
        msg,
        user,
        state
      )
      const nextState = await nextExchangeState(updatedState, tUser.id)
      if (nextState == null) {
        return false
      }

      return exchangeResponder(msg, user, nextState)
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: ExchangeState | null
  ) {
    let currentState = state
    if (
      msg.text ===
      user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
    ) {
      currentState = initialState
    }

    if (currentState && currentState.key === EXCHANGE_STATE_LABEL) {
      const updatedState: ExchangeState | null = exchangeParser(
        msg,
        user,
        currentState
      )

      const nextState: ExchangeState | null = await nextExchangeState(
        updatedState,
        tUser.id
      )

      if (nextState === null) {
        return false
      }

      return exchangeResponder(msg, user, nextState)
    } else {
      return false
    }
  }
}
