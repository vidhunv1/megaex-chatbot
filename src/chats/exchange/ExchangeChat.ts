import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  EXCHANGE_STATE_KEY,
  ExchangeState,
  initialState
} from './ExchangeState'
import { exchangeParser } from './exchangeParser'
import { exchangeResponder } from './exchangeResponder'

export const ExchangeChat: ChatHandler = {
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
    state: ExchangeState | null
  ) {
    let currentState = state
    if (
      msg.text ===
      user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
    ) {
      currentState = initialState
    }

    if (currentState && currentState.key === EXCHANGE_STATE_KEY) {
      const nextState: ExchangeState | null = await exchangeParser(
        msg,
        tUser.id,
        user,
        currentState
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
