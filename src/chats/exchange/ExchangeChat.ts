import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import {
  EXCHANGE_STATE_LABEL,
  ExchangeState,
  initialState
} from './ExchangeState'
import { parseCallbackQuery } from 'chats/utils'
import * as _ from 'lodash'
import {
  ExchangeHomeStateKey,
  ExchangeHomeResponder,
  ExchangeParser
} from './home'
import { BuyStateKey, BuyParser, BuyResponder } from './buy'
import { SellStateKey, SellParser, SellResponder } from './sell'
import { MyOrdersStateKey, MyOrdersParser, MyOrdersResponder } from './myOrders'
import {
  CreateOrderStateKey,
  CreateOrderParser,
  CreateOrderResponder
} from './createOrder'

export const ExchangeChat: ChatHandler = {
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
    state: ExchangeState | null
  ) {
    if (callback.data) {
      const { type, params } = parseCallbackQuery(callback.data)

      const callbackName = type as any
      if (_.get(state, 'key', null) != EXCHANGE_STATE_LABEL) {
        if (
          [
            BuyStateKey.cb_buy,
            SellStateKey.cb_sell,
            MyOrdersStateKey.cb_showActiveOrders,
            MyOrdersStateKey.cb_editRate,
            MyOrdersStateKey.cb_editAmount,
            MyOrdersStateKey.cb_editTerms,
            MyOrdersStateKey.cb_editPaymentMethod,
            MyOrdersStateKey.cb_toggleActive,
            MyOrdersStateKey.cb_deleteOrder,
            MyOrdersStateKey.cb_editOrder,
            CreateOrderStateKey.cb_showCreateOrder,
            CreateOrderStateKey.cb_createNewOrder
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
    state: ExchangeState | null
  ) {
    let currentState = state
    if (
      msg.text ===
      user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
    ) {
      currentState = _.clone(initialState)
    }

    if (currentState && currentState.key === EXCHANGE_STATE_LABEL) {
      return await processMessage(msg, user, tUser, currentState)
    } else {
      return false
    }
  }
}

const exchangeHomeStateKeys = Object.keys(ExchangeHomeStateKey)
const buyStateKeys = Object.keys(BuyStateKey)
const sellStateKeys = Object.keys(SellStateKey)
const myOrdersKeys = Object.keys(MyOrdersStateKey)
const createOrderKeys = Object.keys(CreateOrderStateKey)

async function processMessage(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  state: ExchangeState
) {
  let nextState = null

  // Input parse
  if (exchangeHomeStateKeys.includes(state.currentStateKey))
    nextState = await ExchangeParser(msg, user, tUser, state)
  if (buyStateKeys.includes(state.currentStateKey))
    nextState = await BuyParser(msg, user, tUser, state)
  if (sellStateKeys.includes(state.currentStateKey))
    nextState = await SellParser(msg, user, tUser, state)
  if (myOrdersKeys.includes(state.currentStateKey))
    nextState = await MyOrdersParser(msg, user, tUser, state)
  if (createOrderKeys.includes(state.currentStateKey))
    nextState = await CreateOrderParser(msg, user, tUser, state)

  if (nextState === null) {
    return false
  }

  // Response
  if (exchangeHomeStateKeys.includes(nextState.currentStateKey)) {
    return await ExchangeHomeResponder(msg, user, nextState)
  }
  if (buyStateKeys.includes(nextState.currentStateKey)) {
    return await BuyResponder(msg, user, nextState)
  }
  if (sellStateKeys.includes(nextState.currentStateKey)) {
    return await SellResponder(msg, user, nextState)
  }
  if (myOrdersKeys.includes(nextState.currentStateKey)) {
    return await MyOrdersResponder(msg, user, nextState)
  }
  if (createOrderKeys.includes(nextState.currentStateKey)) {
    return await CreateOrderResponder(msg, user, nextState)
  }

  return false
}
