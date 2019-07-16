import { DealsStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { DealsMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import {
  OrderType,
  Order,
  User,
  Trade,
  TelegramAccount,
  TradeStatus,
  PaymentMethod,
  Transaction
} from 'models'
import { DealsConfig } from './config'
import { logger } from 'modules'
import { sendTradeMessage } from './tradeMessage'
import { showOrder, getOrderInfo } from './utils'

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

      await showOrder(msg, user, orderId)

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

      const order = await getOrderInfo(orderId)
      if (order.dealer) {
        await DealsMessage(msg, user).showOpenDealRequest(
          order.dealer.telegramUser.id
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
      const orderInfo = await getOrderInfo(orderId)
      if (orderInfo.dealer == null || orderInfo.order == null) {
        return false
      }

      const { order } = orderInfo

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

      let actualMaxAmount
      if (order.orderType == OrderType.SELL) {
        actualMaxAmount =
          availableBalanceInFiat < order.maxFiatAmount
            ? availableBalanceInFiat
            : order.maxFiatAmount
      } else {
        actualMaxAmount = order.maxFiatAmount
      }

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
        actualMaxAmount
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
      const order = (await getOrderInfo(orderId)).order
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
      if (!trade) {
        return false
      }

      const telegramAccount = await TelegramAccount.findOne({
        where: {
          userId: user.id
        }
      })
      if (!telegramAccount) {
        return false
      }

      await sendTradeMessage[trade.trade.status](
        trade.trade,
        user,
        telegramAccount
      )
      return true
    },
    [DealsStateKey.showDealInitCancel]: async () => {
      await DealsMessage(msg, user).showDealInitCancel()
      return true
    },

    [DealsStateKey.cb_respondToTradeInit]: async () => {
      return false
    },
    [DealsStateKey.respondToTradeInit]: async () => {
      const confirmation = _.get(
        state[DealsStateKey.cb_respondToTradeInit],
        'confirmation',
        null
      )
      const tradeId = parseInt(
        _.get(state[DealsStateKey.cb_respondToTradeInit], 'tradeId', null) + ''
      )
      if (confirmation === null || tradeId === null) {
        return false
      }

      const openedTradeId = parseInt(
        _.get(
          state[DealsStateKey.cb_respondToTradeInit],
          'data.openedTradeId',
          null
        ) + ''
      )

      if (isNaN(openedTradeId)) {
        const telegramAccount = await TelegramAccount.findOne({
          where: {
            userId: user.id
          }
        })
        const trade = await Trade.findById(tradeId)
        if (!telegramAccount || !trade) {
          return false
        }

        await sendTradeMessage[TradeStatus.REJECTED](
          trade,
          user,
          telegramAccount
        )
        return true
      }

      if (openedTradeId != tradeId) {
        await DealsMessage(msg, user).showAcceptDealError()
        return true
      }

      const trade = await Trade.findById(tradeId, {
        include: [{ model: Order }]
      })
      if (!trade) return false

      const telegramAccount = await TelegramAccount.findOne({
        where: {
          userId: user.id
        }
      })

      if (!telegramAccount) {
        return false
      }
      await sendTradeMessage[trade.status](trade, user, telegramAccount)
      return true
    },
    [DealsStateKey.cb_cancelTrade]: async () => {
      return false
    },
    [DealsStateKey.cb_cancelTradeConfirm]: async () => {
      return false
    },
    [DealsStateKey.cancelTradeConfirm]: async () => {
      const confirmation = _.get(
        state[DealsStateKey.cb_cancelTradeConfirm],
        'confirmation',
        null
      )
      const tradeId = _.get(
        state[DealsStateKey.cb_cancelTradeConfirm],
        'tradeId',
        null
      )
      if (!confirmation || !tradeId) {
        return false
      }

      const data = _.get(state[DealsStateKey.cancelTradeConfirm], 'data', null)
      const canceledTradeId = _.get(data, 'canceledTradeId', null)
      const trade = await Trade.findById(tradeId)
      if (canceledTradeId) {
        if (trade) {
          const telegramAccount = await TelegramAccount.findOne({
            where: {
              userId: user.id
            }
          })
          if (!telegramAccount) {
            return false
          }
          await sendTradeMessage[trade.status](trade, user, telegramAccount)
        }
      } else {
        if (confirmation === 'no') {
          if (trade) {
            const telegramAccount = await TelegramAccount.findOne({
              where: {
                userId: user.id
              }
            })
            if (!telegramAccount) {
              return false
            }
            await sendTradeMessage[trade.status](trade, user, telegramAccount)
          }
        } else {
          await DealsMessage(msg, user).cancelTradeBadFail()
        }
      }
      return true
    },
    [DealsStateKey.cancelTradeGetConfirm]: async () => {
      const tradeId = _.get(
        state[DealsStateKey.cb_cancelTrade],
        'tradeId',
        null
      )
      if (!tradeId) {
        return false
      }

      const trade = await getTrade(tradeId)
      if (!trade) {
        return false
      }

      await DealsMessage(msg, user).cancelTradeConfirm(
        trade.trade.id,
        trade.trade.cryptoAmount * trade.trade.fixedRate,
        trade.trade.fiatCurrencyCode
      )
      return true
    },
    [DealsStateKey.cb_paymentSent]: async () => {
      return false
    },
    [DealsStateKey.paymentSent]: async () => {
      const tradeId = _.get(
        state[DealsStateKey.cb_paymentSent],
        'tradeId',
        null
      )
      if (tradeId == null) {
        return false
      }
      const trade = await Trade.findById(tradeId)
      if (!trade) {
        return false
      }

      await DealsMessage(msg, user).confirmPaymentSent(
        tradeId,
        trade.fiatAmount,
        trade.fiatCurrencyCode,
        trade.paymentMethodType
      )
      return true
    },
    [DealsStateKey.confirmPaymentSent]: async () => {
      const confirmation = _.get(
        state[DealsStateKey.cb_confirmPaymentSent],
        'confirmation',
        null
      )
      const tradeId = _.get(
        state[DealsStateKey.cb_confirmPaymentSent],
        'tradeId',
        null
      )
      if (!confirmation || !tradeId) {
        return false
      }
      const data = _.get(
        state[DealsStateKey.cb_confirmPaymentSent],
        'data',
        null
      )
      const updatedTradeId = _.get(data, 'updatedTradeId', null)
      const trade = await Trade.findById(tradeId)

      if (!confirmation || confirmation === 'no') {
        if (trade) {
          const u = await User.findById(user.id, {
            include: [{ model: TelegramAccount }]
          })
          if (!u) {
            return false
          }
          await sendTradeMessage[trade.status](trade, u, u.telegramUser)
          return true
        }
        return false
      }

      if (updatedTradeId) {
        if (trade) {
          const u = await User.findById(user.id, {
            include: [{ model: TelegramAccount }]
          })
          if (!u) {
            return false
          }
          await sendTradeMessage[trade.status](trade, u, u.telegramUser)
          return true
        }
      } else {
        const error = _.get(
          state[DealsStateKey.cb_confirmPaymentSent],
          'error',
          null
        )
        if (error) {
          await DealsMessage(msg, user).showDealsError(error)
        }
      }
      return false
    },
    [DealsStateKey.cb_confirmPaymentSent]: async () => {
      return false
    },
    [DealsStateKey.cb_startDispute]: async () => {
      return false
    },
    [DealsStateKey.startDispute]: async () => {
      const tradeId = _.get(
        state[DealsStateKey.cb_startDispute],
        'tradeId',
        null
      )
      const userId = _.get(state[DealsStateKey.cb_startDispute], 'userId', null)
      if (tradeId === null || userId === null) {
        return false
      }

      const trade = await Trade.findById(tradeId)
      const u = await User.findById(userId, {
        include: [{ model: TelegramAccount }]
      })
      if (!trade || !u) {
        return false
      }

      await sendTradeMessage[trade.status](trade, u, u.telegramUser)
      return true
    },

    [DealsStateKey.cb_paymentReceived]: async () => {
      return false
    },
    [DealsStateKey.paymentReceived]: async () => {
      const tradeId = _.get(
        state[DealsStateKey.cb_paymentReceived],
        'tradeId',
        null
      )
      if (!tradeId) {
        return false
      }

      const trade = await Trade.findById(tradeId)
      if (!trade) return false
      await DealsMessage(msg, user).confirmPaymentReceived(
        trade.id,
        trade.fiatAmount,
        trade.fiatCurrencyCode
      )
      return true
    },
    [DealsStateKey.cb_confirmPaymentReceived]: async () => {
      return false
    },
    [DealsStateKey.confirmPaymentReceived]: async () => {
      const confirmation = _.get(
        state[DealsStateKey.cb_confirmPaymentReceived],
        'confirmation',
        null
      )
      const tradeId = _.get(
        state[DealsStateKey.cb_confirmPaymentReceived],
        'tradeId',
        null
      )
      if (!confirmation || !tradeId) {
        return false
      }
      const data = _.get(
        state[DealsStateKey.cb_confirmPaymentReceived],
        'data',
        null
      )
      const updatedTradeId = _.get(data, 'updatedTradeId', null)
      const trade = await Trade.findById(tradeId)

      if (!confirmation || confirmation === 'no') {
        if (trade) {
          const u = await User.findById(user.id, {
            include: [{ model: TelegramAccount }]
          })
          if (!u) {
            return false
          }
          await sendTradeMessage[trade.status](trade, u, u.telegramUser)
          return true
        }
        return false
      }
      if (updatedTradeId) {
        if (trade) {
          const u = await User.findById(user.id, {
            include: [{ model: TelegramAccount }]
          })
          if (!u) {
            return false
          }
          await sendTradeMessage[trade.status](trade, u, u.telegramUser)
          return true
        }
      } else {
        const error = _.get(
          state[DealsStateKey.cb_confirmPaymentReceived],
          'error',
          null
        )
        if (error) {
          await DealsMessage(msg, user).showDealsError(error)
        }
      }
      return false
    },
    [DealsStateKey.cb_giveRating]: async () => {
      return false
    },
    [DealsStateKey.getReview]: async () => {
      await DealsMessage(msg, user).getReview()
      return true
    },
    [DealsStateKey.endReview]: async () => {
      await DealsMessage(msg, user).endReview()
      return true
    },
    [DealsStateKey.inputPaymentDetails]: async () => {
      const orderId = _.get(state[DealsStateKey.cb_openDeal], 'orderId', null)
      if (orderId == null) {
        return false
      }

      const order = await Order.findById(orderId)
      if (!order) {
        return false
      }

      const paymentMethodType = order.paymentMethodType
      const addedPms = (await PaymentMethod.getSavedPaymentMethods(
        user.id
      )).filter((pm) => pm.paymentMethod === paymentMethodType)
      await DealsMessage(msg, user).inputPaymentDetails(
        paymentMethodType,
        addedPms
      )
      return true
    },
    [DealsStateKey.cb_selectPaymentDetail]: async () => {
      return false
    }
  }

  return resp[state.currentStateKey as DealsStateKey]()
}

async function getTrade(
  tradeId: number
): Promise<{
  trade: Trade
  dealer: User
} | null> {
  logger.error('TODO: Implement getTrade')
  const trade = await Trade.findById(tradeId)
  if (!trade) {
    return null
  }

  const dealer = await User.findById(trade.getOpUserId())
  if (!dealer) {
    return null
  }

  return {
    trade: trade,
    dealer
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
      userId: o.userId,
      availableBalance: o.availableFiatBalance,
      minFiatAmount: o.minFiatAmount
    }
  })

  return { orderList: mapOrders, totalOrders }
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}
