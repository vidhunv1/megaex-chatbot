import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount, OrderType } from 'models'
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
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'

export const ExchangeChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    command: BotCommand,
    user: User,
    _tUser: TelegramAccount
  ) {
    if (command === BotCommand.ORDER && msg.text) {
      try {
        const orderId = parseInt(msg.text.replace(BotCommand.ORDER, ''))
        const { order, dealer } = await getOrder(orderId)
        if (!order || !dealer) {
          await DealsMessage(msg, user).showError(DealsError.ORDER_NOT_FOUND)
          return true
        }

        await DealsMessage(msg, user).showDeal(
          order.orderType,
          order.orderId,
          order.cryptoCurrencyCode,
          dealer.realName,
          dealer.accountId,
          dealer.lastSeen,
          dealer.rating,
          dealer.tradeCount,
          order.terms,
          order.paymentMethod,
          order.rate,
          order.amount,
          order.fiatCurrencyCode,
          dealer.reviewCount
        )
      } catch (e) {
        await DealsMessage(msg, user).showError(DealsError.ORDER_NOT_FOUND)
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

async function getOrder(orderId: number) {
  if (orderId == 1) {
    return {
      order: {
        orderId: orderId,
        orderType: OrderType.SELL,
        cryptoCurrencyCode: CryptoCurrency.BTC,
        fiatCurrencyCode: FiatCurrency.INR,
        rate: 310002,
        rating: 4.9,
        amount: {
          min: 0.1,
          max: 0.5
        },
        paymentMethod: PaymentMethods.CASH,
        isEnabled: true,
        terms: 'Please transfer fast..'
      },
      dealer: {
        realName: 'Satoshi',
        accountId: 'uxawsats',
        rating: 4.7,
        lastSeen: new Date(),
        tradeCount: 5,
        reviewCount: 30
      }
    }
  } else {
    return {
      order: null,
      dealer: null
    }
  }
}
