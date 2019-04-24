import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import { WALLET_STATE_LABEL, WalletState, initialState } from './WalletState'
import { parseCallbackQuery } from 'chats/utils'
import * as _ from 'lodash'
import { DepositStateKey, DepositParser, DepositResponder } from './deposit'
import { WithdrawStateKey, WithdrawParser, WithdrawResponder } from './withdraw'
import { WalletHomeParser, WalletHomeStateKey, WalletResponder } from './home'
import { SendCoinParser, SendCoinStateKey, SendCoinResponder } from './sendCoin'

export const WalletChat: ChatHandler = {
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
    state: WalletState | null
  ) {
    if (callback.data) {
      const { type, params } = parseCallbackQuery(callback.data)

      const callbackName = type as any
      if (_.get(state, 'key', null) != WALLET_STATE_LABEL) {
        // Callback types allowed to answer indirectly
        if (
          [
            SendCoinStateKey.cb_sendCoin,
            DepositStateKey.cb_depositCoin,
            WithdrawStateKey.cb_withdrawCoin
          ].includes(callbackName)
        ) {
          state = _.clone(initialState)
        } else {
          return false
        }
      }

      if (!state) {
        return false
      }

      state.currentStateKey = callbackName
      // @ts-ignore
      state[callbackName] = params

      return await processMessage(msg, user, tUser, state)
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: WalletState | null
  ) {
    let currentState: WalletState | null = state

    if (msg.text === user.t('main-menu.wallet')) {
      currentState = initialState
    }

    if (currentState && currentState.key === WALLET_STATE_LABEL) {
      return await processMessage(msg, user, tUser, currentState)
    } else {
      return false
    }
  }
}

const walletHomeStateKeys = Object.keys(WalletHomeStateKey)
const depositStateKeys = Object.keys(DepositStateKey)
const sendCoinStateKeys = Object.keys(SendCoinStateKey)
const withdrawStateKeys = Object.keys(WithdrawStateKey)

async function processMessage(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  state: WalletState
) {
  let nextState = null

  // Input parse
  if (walletHomeStateKeys.includes(state.currentStateKey))
    nextState = await WalletHomeParser(msg, user, tUser, state)
  if (depositStateKeys.includes(state.currentStateKey))
    nextState = await DepositParser(msg, user, tUser, state)
  if (sendCoinStateKeys.includes(state.currentStateKey))
    nextState = await SendCoinParser(msg, user, tUser, state)
  if (withdrawStateKeys.includes(state.currentStateKey))
    nextState = await WithdrawParser(msg, user, tUser, state)

  if (nextState === null) {
    return false
  }

  // Response
  if (walletHomeStateKeys.includes(nextState.currentStateKey)) {
    return await WalletResponder(msg, user, nextState)
  }
  if (depositStateKeys.includes(nextState.currentStateKey)) {
    return await DepositResponder(msg, user, nextState)
  }
  if (sendCoinStateKeys.includes(nextState.currentStateKey)) {
    return await SendCoinResponder(msg, user, nextState)
  }
  if (Object.keys(WithdrawStateKey).includes(nextState.currentStateKey)) {
    return await WithdrawResponder(msg, user, nextState)
  }

  return false
}
