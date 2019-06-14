import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount, Order, Transaction, Trade } from 'models'
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
import { CryptoCurrency } from 'constants/currencies'
import { sendTradeMessage } from './deals/tradeMessage'

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
        const orderInfo = await getOrderDetails(orderId)
        if (orderInfo.order == null || orderInfo.dealer == null) {
          await DealsMessage(msg, user).showError(DealsError.ORDER_NOT_FOUND)
          return true
        }

        const order = orderInfo.order
        const dealer = orderInfo.dealer

        const availableBalance = await getAvailableBalance(
          order.userId,
          order.cryptoCurrencyCode
        )
        const availableBalanceInFiat =
          (await Order.convertToFixedRate(
            order.rate,
            order.rateType,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.user.exchangeRateSource
          )) * availableBalance
        await DealsMessage(msg, user).showDeal(
          order.orderType,
          order.id,
          order.cryptoCurrencyCode,
          dealer.telegramUser.firstName,
          dealer.accountId,
          dealer.lastSeen,
          dealer.rating,
          dealer.tradeCount,
          order.terms,
          order.paymentMethodType,
          await Order.convertToFixedRate(
            order.rate,
            order.rateType,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.user.exchangeRateSource
          ),
          {
            min: order.minFiatAmount,
            max: order.maxFiatAmount
          },
          availableBalanceInFiat,
          order.fiatCurrencyCode,
          dealer.reviewCount
        )
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
            DealsStateKey.cb_startDispute,
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

async function getOrderDetails(orderId: number) {
  logger.error('TODO: Implement getOrder with user details')

  const order = await Order.getOrder(orderId)
  if (order == null) {
    return {
      order: null,
      dealer: null
    }
  }

  const dealer = await User.getUser(order.userId)
  if (dealer == null) {
    return {
      order: null,
      dealer: null
    }
  }

  return {
    order: order,
    dealer: {
      ...dealer,
      rating: 4.7,
      lastSeen: new Date(),
      tradeCount: 5,
      reviewCount: 30
    }
  }
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}
