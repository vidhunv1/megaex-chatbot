import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount, Trade } from 'models'
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
import { MyOrdersStateKey, MyOrdersParser, MyOrdersResponder } from './myOrders'
import {
  CreateOrderStateKey,
  CreateOrderParser,
  CreateOrderResponder
} from './createOrder'
import {
  DealsStateKey,
  DealsParser,
  DealsResponder,
  DealsMessage,
  DealsError
} from './deals'
import { logger } from 'modules'
import { sendTradeMessage } from './deals/tradeMessage'
import { showOrder } from './deals/utils'

export const ExchangeChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    command: BotCommand,
    user: User,
    tUser: TelegramAccount
  ) {
    if (command === BotCommand.TRADE && msg.text) {
      const tradeId = parseInt(msg.text.replace(BotCommand.TRADE, ''))
      if (!tradeId) {
        return false
      }
      const trade = await Trade.findById(tradeId)
      if (!trade) {
        return false
      }

      await sendTradeMessage[trade.status](trade, user, tUser)
      return true
    } else if (command === BotCommand.ORDER && msg.text) {
      try {
        const orderId = parseInt(msg.text.replace(BotCommand.ORDER, ''))
        await showOrder(msg, user, orderId)
      } catch (e) {
        logger.error('ERROR occurred ' + JSON.stringify(e))
        await DealsMessage(msg, user).showError(DealsError.ORDER_NOT_FOUND)
        throw e
      }

      return true
    }
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
            DealsStateKey.cb_deals,
            DealsStateKey.cb_nextDeals,
            DealsStateKey.cb_prevDeals,
            DealsStateKey.cb_showDealById,
            DealsStateKey.cb_respondToTradeInit,
            DealsStateKey.cb_cancelTrade,
            DealsStateKey.cb_paymentSent,
            DealsStateKey.cb_paymentReceived,
            DealsStateKey.cb_startDispute,
            DealsStateKey.cb_giveRating,
            MyOrdersStateKey.cb_showActiveOrders,
            MyOrdersStateKey.cb_editRate,
            MyOrdersStateKey.cb_editAmount,
            MyOrdersStateKey.cb_editTerms,
            MyOrdersStateKey.cb_editPaymentMethod,
            MyOrdersStateKey.cb_toggleActive,
            MyOrdersStateKey.cb_deleteOrder,
            MyOrdersStateKey.cb_editOrder,
            CreateOrderStateKey.cb_showCreateOrder,
            CreateOrderStateKey.cb_createNewOrder,

            DealsStateKey.cb_cancelTradeConfirm,
            DealsStateKey.cb_respondToTradeInit,
            DealsStateKey.cb_confirmPaymentSent,
            DealsStateKey.cb_confirmPaymentReceived,
            DealsStateKey.cb_confirmInputDealAmount,
            DealsStateKey.cb_selectPaymentDetail,
            DealsStateKey.cb_openDeal
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
    if (state && state.key === EXCHANGE_STATE_LABEL) {
      return await processMessage(msg, user, tUser, state)
    } else {
      return false
    }
  },

  async handleRoot(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    if (
      msg.text ===
      user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
    ) {
      return await this.handleContext(msg, user, tUser, _.clone(initialState))
    }

    return false
  }
}

const exchangeHomeStateKeys = Object.keys(ExchangeHomeStateKey)
const dealsStateKeys = Object.keys(DealsStateKey)
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
  if (dealsStateKeys.includes(state.currentStateKey))
    nextState = await DealsParser(msg, user, tUser, state)
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
  if (dealsStateKeys.includes(nextState.currentStateKey)) {
    return await DealsResponder(msg, user, nextState)
  }
  if (myOrdersKeys.includes(nextState.currentStateKey)) {
    return await MyOrdersResponder(msg, user, nextState)
  }
  if (createOrderKeys.includes(nextState.currentStateKey)) {
    return await CreateOrderResponder(msg, user, nextState)
  }

  return false
}
