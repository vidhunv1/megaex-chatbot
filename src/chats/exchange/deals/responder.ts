import { DealsStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState, TradeStatus } from '../ExchangeState'
import { DealsMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { OrderType, Order, User, Transaction } from 'models'
import { DealsConfig } from './config'
import { logger } from 'modules'

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

      const { orderList, totalOrders } = await getOrdersList(
        orderType,
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
          order.cryptoCurrencyCode,
          order.fiatCurrencyCode,
          order.user.exchangeRateSource
        )

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
          trueRate,
          {
            min: order.minFiatAmount,
            max: order.maxFiatAmount
          },
          availableBalanceInFiat,
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

    [DealsStateKey.dealError]: async () => {
      const error = _.get(state, `${state.previousStateKey}.error`, null)
      await DealsMessage(msg, user).showDealsError(error)
      return true
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

      const { order } = orderInfo

      await DealsMessage(msg, user).inputDealAmount(
        order.orderType,
        order.fiatCurrencyCode,
        await Order.convertToFixedRate(
          order.rate,
          order.rateType,
          order.cryptoCurrencyCode,
          order.fiatCurrencyCode,
          order.user.exchangeRateSource
        ),
        order.cryptoCurrencyCode,
        order.minFiatAmount,
        order.maxFiatAmount
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
        await Order.convertToFixedRate(
          order.rate,
          order.rateType,
          order.cryptoCurrencyCode,
          order.fiatCurrencyCode,
          order.user.exchangeRateSource
        )
      )
      return true
    },
    [DealsStateKey.cb_confirmInputDealAmount]: async () => {
      return false
    },
    [DealsStateKey.cb_respondDealInit]: async () => {
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

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
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
  fiatCurrencyCode: FiatCurrency,
  cursor: number,
  limit: number
) {
  // TODO: Fix inefficient query
  const orders = await Order.getQuickDealList(orderType, fiatCurrencyCode)
  // for SELL: Show all orders with available balance first, rest are shown at last
  let orderList = _.filter(
    orders,
    (o) =>
      o.orderType === orderType &&
      (o.availableFiatBalance >= o.minFiatAmount || orderType == OrderType.BUY)
  )
  orderList = _.orderBy(orderList, (o) => o.fixedRate, [
    orderType === OrderType.BUY ? 'desc' : 'asc'
  ])
  // Move all orders without available balance to end
  orderList.push(
    ..._.orderBy(
      _.filter(
        orders,
        (o) =>
          o.availableFiatBalance < o.minFiatAmount &&
          orderType === OrderType.SELL &&
          o.orderType === orderType
      ),
      (o) => o.fixedRate,
      [orderType === OrderType.BUY ? 'desc' : 'asc']
    )
  )

  const totalOrders = orderList.length

  const slicedOrderList = orderList.slice(cursor, cursor + limit)

  const mapOrders = slicedOrderList.map((o) => {
    return {
      id: o.id,
      fixedRate: o.fixedRate,
      paymentMethodType: o.paymentMethodType,
      fiatCurrencyCode: o.fiatCurrencyCode,
      rating: o.rating,
      availableBalance: o.availableFiatBalance,
      minFiatAmount: o.minFiatAmount
    }
  })

  return { orderList: mapOrders, totalOrders }
}
