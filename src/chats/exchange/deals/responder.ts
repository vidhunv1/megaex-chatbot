import { DealsStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState, TradeStatus } from '../ExchangeState'
import { DealsMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethodType } from 'models/PaymentMethod'
import { OrderType, Order, User } from 'models'
import { DealsConfig } from './config'
import logger from 'modules/Logger'

const CURRENT_CRYPTOCURRENCY_CODE = CryptoCurrency.BTC

export const DealsResponder: Responder<ExchangeState> = (msg, user, state) => {
  const resp: Record<DealsStateKey, () => Promise<boolean>> = {
    [DealsStateKey.cb_deals]: async () => {
      return false
    },
    [DealsStateKey.deals_show]: async () => {
      const cursor = _.get(state[DealsStateKey.deals_show], 'data.cursor', 0)
      const shouldEdit = _.get(
        state[DealsStateKey.deals_show],
        'data.shouldEdit',
        false
      ) as boolean
      const orderType = _.get(state[DealsStateKey.cb_deals], 'orderType', null)
      if (orderType === null) {
        return false
      }

      const orderTypeForUser =
        orderType === OrderType.BUY ? OrderType.SELL : OrderType.BUY
      const { orderList, totalOrders } = await getOrdersList(
        orderTypeForUser,
        user.currencyCode,
        cursor,
        DealsConfig.LIST_LIMIT
      )

      await DealsMessage(msg, user).showDealsMessage(
        CURRENT_CRYPTOCURRENCY_CODE,
        orderType,
        orderList,
        totalOrders,
        cursor,
        shouldEdit
      )
      return true
    },
    [DealsStateKey.cb_prevDeals]: async () => {
      return false
    },
    [DealsStateKey.cb_nextDeals]: async () => {
      return false
    },
    [DealsStateKey.cb_showDealById]: async () => {
      return false
    },
    [DealsStateKey.showDealById]: async () => {
      const orderId = _.get(
        state[DealsStateKey.cb_showDealById],
        'orderId',
        null
      )
      if (orderId === null) {
        return false
      }

      const { order, dealer } = await getOrder(orderId)
      if (order != null && dealer != null) {
        const trueRate: number = await Order.convertToFixedRate(
          order.rate,
          order.rateType,
          order.fiatCurrencyCode,
          dealer.exchangeRateSource
        )

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
          trueRate,
          {
            min: order.minAmount,
            max: order.maxAmount
          },
          await getAvailableBalance(dealer.id),
          order.fiatCurrencyCode,
          dealer.reviewCount
        )
      }

      return true
    },
    [DealsStateKey.cb_openDeal]: async () => {
      return false
    },
    [DealsStateKey.cb_requestDealDeposit]: async () => {
      return false
    },
    [DealsStateKey.requestDealDeposit_show]: async () => {
      const orderId = _.get(
        state[DealsStateKey.cb_requestDealDeposit],
        'orderId',
        null
      )
      if (orderId == null) {
        return false
      }

      const order = await getOrder(orderId)
      if (order.dealer) {
        await DealsMessage(msg, user).showOpenDealRequest(
          order.dealer.telegramUser.username
        )
        return true
      }
      return false
    },

    [DealsStateKey.inputDealAmount]: async () => {
      const orderId = _.get(
        state[DealsStateKey.inputDealAmount],
        'orderId',
        null
      )
      if (orderId == null) {
        return false
      }
      const orderInfo = await getOrder(orderId)
      if (orderInfo.dealer == null || orderInfo.order == null) {
        return false
      }

      const { order, dealer } = orderInfo

      await DealsMessage(msg, user).inputDealAmount(
        order.orderType,
        order.fiatCurrencyCode,
        await Order.convertToFixedRate(
          order.rate,
          order.rateType,
          order.fiatCurrencyCode,
          dealer.exchangeRateSource
        ),
        order.cryptoCurrencyCode,
        order.minAmount,
        order.maxAmount
      )
      return true
    },
    [DealsStateKey.confirmInputDealAmount]: async () => {
      const orderId = _.get(
        state[DealsStateKey.inputDealAmount],
        'orderId',
        null
      )
      const inputData = _.get(
        state[DealsStateKey.inputDealAmount],
        'data',
        null
      )
      if (orderId == null || inputData == null) {
        return false
      }
      const order = (await getOrder(orderId)).order
      if (order == null) {
        return false
      }

      await DealsMessage(msg, user).confirmInputDealAmount(
        order.orderType,
        order.cryptoCurrencyCode,
        order.fiatCurrencyCode,
        inputData.fiatValue,
        order.rate
      )
      return true
    },
    [DealsStateKey.cb_confirmInputDealAmount]: async () => {
      return false
    },
    [DealsStateKey.showDealInitOpened]: async () => {
      const stateData = _.get(
        state[DealsStateKey.showDealInitOpened],
        'data',
        null
      )
      if (stateData == null) {
        return false
      }

      const trade = await getTrade(stateData.tradeId)
      await DealsMessage(msg, user).showOpenedTrade(
        trade.trade.tradeId,
        trade.dealer.accountId
      )

      return true
    },
    [DealsStateKey.showDealInitCancel]: async () => {
      await DealsMessage(msg, user).showDealInitCancel()
      return true
    }
  }

  return resp[state.currentStateKey as DealsStateKey]()
}

async function getOrder(orderId: number) {
  logger.error('TODO: Implement getOrder with user details')

  const order = await Order.getOrder(orderId)
  if (!order) {
    return {
      order: null,
      dealer: null
    }
  }

  const dealer = await User.getUser(order.userId)
  if (!dealer) {
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

// TODO: -----------
async function getAvailableBalance(_userId: number) {
  return 0
}

async function getTrade(tradeId: number) {
  logger.error('TODO: Implement getTrade')
  return {
    trade: {
      tradeId: tradeId,
      status: TradeStatus.INITIATED
    },
    dealer: {
      accountId: 'uxawsats'
    }
  }
}

async function getOrdersList(
  orderType: OrderType,
  _fiatCurrencyCode: FiatCurrency,
  cursor: number,
  limit: number
) {
  logger.error('TODO: Implement getOrderList')
  // Show all orders with available balance first, rest are shown at last
  let orderList = _.filter(
    orders,
    (o) => o.orderType === orderType && o.availableBalance >= o.amount.min
  )
  orderList = _.orderBy(orderList, (o) => o.rate, [
    orderType === OrderType.BUY ? 'desc' : 'asc'
  ])
  // Move all orders without available balance to end
  orderList.push(
    ..._.filter(
      orders,
      (o) => o.availableBalance < o.amount.min && o.orderType === orderType
    )
  )

  const totalOrders = orderList.length

  return { orderList: orderList.slice(cursor, cursor + limit), totalOrders }
}

const orders = [
  {
    orderId: 1,
    orderType: OrderType.SELL,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310001,
    rating: 4.0,
    amount: {
      min: 0.3,
      max: 0.5
    },
    availableBalance: 0,
    paymentMethod: PaymentMethodType.BANK_TRANSFER_IMPS_INR,
    isEnabled: true,
    terms: 'Please transfer fast..'
  },
  {
    orderId: 4,
    orderType: OrderType.SELL,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310004,
    rating: 4.6,
    availableBalance: 0.2,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethodType.UPI,
    isEnabled: true,
    terms: 'Please transfer fast..'
  },
  {
    orderId: 3,
    orderType: OrderType.BUY,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310003,
    rating: 4.7,
    availableBalance: 0.5,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethodType.PAYTM,
    isEnabled: true,
    terms: 'Please transfer fast..'
  },
  {
    orderId: 2,
    orderType: OrderType.BUY,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310002,
    rating: 4.9,
    availableBalance: 0.5,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethodType.CASH,
    isEnabled: true,
    terms: 'Please transfer fast..'
  }
]

const a = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14]
a.forEach((id) =>
  orders.push({
    orderId: id,
    orderType: id % 2 === 0 ? OrderType.SELL : OrderType.BUY,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310000 + id,
    rating: 4.6,
    availableBalance: 0.5,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethodType.UPI,
    isEnabled: true,
    terms: 'Please transfer fast..'
  })
)
