import { MyOrdersStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { MyOrdersMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethodsFieldsLocale } from 'constants/paymentMethods'
import {
  PaymentMethodType,
  Order,
  PaymentMethod,
  PaymentMethodFields,
  Transaction,
  Market,
  Trade,
  TelegramAccount
} from 'models'
import { OrderType } from 'models'
import { logger } from 'modules'
import { ExchangeSource } from 'constants/exchangeSource'
import { Sequelize } from 'sequelize-typescript'
import { sendTradeMessage } from '../deals/tradeMessage'

const CURRENT_CRYPTOCURRENCY_CODE = CryptoCurrency.BTC
export const MyOrdersResponder: Responder<ExchangeState> = (
  msg,
  user,
  state
) => {
  const resp: Record<MyOrdersStateKey, () => Promise<boolean>> = {
    [MyOrdersStateKey.cb_showActiveOrders]: async () => {
      return false
    },
    [MyOrdersStateKey.showActiveOrders]: async () => {
      const d = await getActive(user.id)
      await MyOrdersMessage(msg, user).showActiveOrders(d.orders, d.trades)
      return true
    },
    [MyOrdersStateKey.cb_deleteOrder]: async () => {
      return false
    },
    [MyOrdersStateKey.showDeleteSuccess]: async () => {
      await MyOrdersMessage(msg, user).showDeleteSuccess()
      return true
    },
    [MyOrdersStateKey.cb_editAmount]: async () => {
      return false
    },
    [MyOrdersStateKey.cb_editOrder]: async () => {
      return true
    },

    [MyOrdersStateKey.cb_editPaymentMethod]: async () => {
      return false
    },
    [MyOrdersStateKey.editPaymentMethod_show]: async () => {
      const addedPm = await getAddedPaymentMethods(user.id)

      let pms: {
        paymentMethod: PaymentMethodType
        pmId: number | null
        pmFields: string[] | null
      }[] = Object.keys(PaymentMethodType).map((pm) => ({
        paymentMethod: pm as PaymentMethodType,
        pmId: null,
        pmFields: null
      }))

      pms = [
        ...addedPm.map((pm) => ({
          paymentMethod: pm.paymentMethod,
          pmId: pm.id,
          pmFields: pm.fields
        })),
        ...pms
      ]

      await MyOrdersMessage(msg, user).showEditPaymentMethod(pms)
      return true
    },
    [MyOrdersStateKey.cb_editPaymentMethodSelected]: async () => {
      return false
    },

    [MyOrdersStateKey.cb_editPaymentDetails]: async () => {
      return false
    },
    [MyOrdersStateKey.editPaymentDetails_show]: async () => {
      const details = _.get(
        state[MyOrdersStateKey.editPaymentDetails_show],
        'data',
        null
      )
      if (details === null) {
        return false
      }

      if (
        details.fields.length <=
        PaymentMethodsFieldsLocale[details.paymentMethod].length
      ) {
        await MyOrdersMessage(msg, user).inputPaymentDetails(
          details.paymentMethod,
          details.fields.length + 1
        )
      }

      return true
    },

    [MyOrdersStateKey.cb_editRate]: async () => {
      return false
    },
    [MyOrdersStateKey.editRate_show]: async () => {
      const marketRate = await getMarketRate(
        CURRENT_CRYPTOCURRENCY_CODE,
        user.currencyCode,
        user.exchangeRateSource
      )
      await MyOrdersMessage(msg, user).showEditRate(
        CURRENT_CRYPTOCURRENCY_CODE,
        marketRate
      )
      return true
    },

    [MyOrdersStateKey.cb_editAmount]: async () => {
      return false
    },
    [MyOrdersStateKey.editAmount_show]: async () => {
      const marketRate = await getMarketRate(
        CURRENT_CRYPTOCURRENCY_CODE,
        user.currencyCode,
        user.exchangeRateSource
      )
      await MyOrdersMessage(msg, user).showEditAmount(marketRate)
      return true
    },

    [MyOrdersStateKey.cb_editTerms]: async () => {
      return false
    },
    [MyOrdersStateKey.editTerms_show]: async () => {
      await MyOrdersMessage(msg, user).showEditTerms()
      return true
    },

    [MyOrdersStateKey.cb_showOrder_back]: async () => {
      return true
    },
    [MyOrdersStateKey.cb_toggleActive]: async () => {
      return false
    },
    [MyOrdersStateKey.showEditSuccess]: async () => {
      await MyOrdersMessage(msg, user).showEditSuccess()
      return true
    },
    [MyOrdersStateKey.cb_showOrderById]: async () => {
      return false
    },
    [MyOrdersStateKey.showOrderById]: async () => {
      const orderId = _.get(
        state[MyOrdersStateKey.cb_showOrderById],
        'orderId',
        null
      )
      if (orderId === null) {
        return false
      }

      const order = await getOrderInfo(orderId)
      if (order && order.userId == user.id) {
        if (order.orderType === OrderType.BUY) {
          await MyOrdersMessage(msg, user).showMyBuyOrder(
            orderId,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.rate,
            order.rateType,
            {
              min: order.minFiatAmount,
              max: order.maxFiatAmount
            },
            order.paymentMethodType,
            order.isActive,
            order.terms,
            false,
            false,
            true
          )
        } else {
          let paymentMethodFields: string[] = []
          if (order.paymentMethodId) {
            const pm = await getPaymentFields(order.paymentMethodId)
            if (pm) {
              paymentMethodFields = pm.fields
            }
          }

          const availableBalance = await getAvailableBalance(
            user.id,
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
          await MyOrdersMessage(msg, user).showMySellOrder(
            orderId,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.rate,
            order.rateType,
            availableBalanceInFiat,
            {
              min: order.minFiatAmount,
              max: order.maxFiatAmount
            },
            availableBalance,
            order.paymentMethodType,
            paymentMethodFields,
            order.isActive,
            order.terms,
            false,
            false,
            true
          )
        }
      } else {
        logger.error('TODO: Handle show other order')
      }

      return true
    },
    [MyOrdersStateKey.cb_showTradeById]: async () => {
      return false
    },
    [MyOrdersStateKey.showTradeById]: async () => {
      const tradeId = _.get(
        state[MyOrdersStateKey.cb_showTradeById],
        'tradeId',
        null
      )
      if (!tradeId) {
        return false
      }
      const trade = await Trade.findById(tradeId)
      const telegramAccount = await TelegramAccount.findOne({
        where: {
          userId: user.id
        }
      })

      if (!trade || !telegramAccount) {
        return false
      }
      await sendTradeMessage[trade.status](trade, user, telegramAccount)
      return true
    }
  }

  return resp[state.currentStateKey as MyOrdersStateKey]()
}

async function getOrderInfo(orderId: number) {
  return await Order.getOrder(orderId)
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}

async function getPaymentFields(id: number) {
  return await PaymentMethod.getPaymentMethod(id)
}

async function getAddedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}

async function getActive(
  userId: number
): Promise<{
  orders: Order[]
  trades: Trade[]
}> {
  const orders = await Order.findAll({
    where: {
      userId: userId
    }
  })
  const trades = await Trade.findAll({
    where: Sequelize.and(
      { status: Trade.getActiveStatuses() },
      Sequelize.or({ buyerUserId: userId }, { sellerUserId: userId })
    ),
    include: [{ model: Order }]
  })

  return {
    orders,
    trades
  }
}

async function getMarketRate(
  cryptocurrency: CryptoCurrency,
  fiatCurrency: FiatCurrency,
  exchangeRateSource: ExchangeSource
): Promise<number> {
  return await Market.getFiatValue(
    cryptocurrency,
    fiatCurrency,
    exchangeRateSource
  )
}
