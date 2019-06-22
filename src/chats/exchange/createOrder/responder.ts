import { CreateOrderStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { CreateOrderMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import {
  OrderType,
  PaymentMethodFields,
  PaymentMethod,
  Order,
  Transaction,
  Market
} from 'models'
import { ExchangeSource } from 'constants/exchangeSource'
import { PaymentMethodType } from 'models'
import { getAllPaymentMethods } from 'constants/paymentMethods'

const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

export const CreateOrderResponder: Responder<ExchangeState> = (
  msg,
  user,
  state
) => {
  const resp: Record<CreateOrderStateKey, () => Promise<boolean>> = {
    [CreateOrderStateKey.cb_showCreateOrder]: async () => {
      return false
    },
    [CreateOrderStateKey.createOrder_show]: async () => {
      await CreateOrderMessage(msg, user).showCreateOrderMessage()
      return true
    },
    [CreateOrderStateKey.cb_createNewOrder]: async () => {
      return false
    },
    [CreateOrderStateKey.createOrderError]: async () => {
      const error = _.get(
        // @ts-ignore
        state[state.previousStateKey],
        `error`,
        null
      )
      if (error == null) {
        return false
      } else {
        CreateOrderMessage(msg, user).showCreateOrderError(error)
        return true
      }
    },
    [CreateOrderStateKey.cb_useMarginPrice]: async () => {
      return false
    },
    [CreateOrderStateKey.cb_useFixedPrice]: async () => {
      return false
    },

    [CreateOrderStateKey.inputRate]: async () => {
      if (state.previousStateKey === CreateOrderStateKey.cb_useMarginPrice) {
        await CreateOrderMessage(msg, user).inputRateMarginPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(
            CURRENT_CRYPTOCURRENCY,
            user.currencyCode,
            user.exchangeRateSource
          ),
          OrderType.BUY,
          user.exchangeRateSource,
          true
        )
      } else if (
        state.previousStateKey === CreateOrderStateKey.cb_useFixedPrice
      ) {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(
            CURRENT_CRYPTOCURRENCY,
            user.currencyCode,
            user.exchangeRateSource
          ),
          OrderType.BUY,
          true
        )
      } else {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(
            CURRENT_CRYPTOCURRENCY,
            user.currencyCode,
            user.exchangeRateSource
          ),
          OrderType.BUY,
          false
        )
      }
      return true
    },
    [CreateOrderStateKey.inputAmountLimit]: async () => {
      await CreateOrderMessage(msg, user).inputLimits()
      return true
    },
    [CreateOrderStateKey.cb_selectPaymentMethod]: async () => {
      return false
    },
    [CreateOrderStateKey.selectPaymentMethod]: async () => {
      const orderType = _.get(
        state[CreateOrderStateKey.cb_createNewOrder],
        'orderType',
        null
      )
      if (orderType === null) {
        return false
      }

      if (orderType === OrderType.BUY) {
        await CreateOrderMessage(msg, user).selectBuyPaymentMethod(getAllPaymentMethods(user.currencyCode) as PaymentMethodType[])
      } else {
        await CreateOrderMessage(msg, user).selectSellPaymentMethod(
          getAllPaymentMethods(user.currencyCode) as PaymentMethodType[],
          await getAddedPaymentMethods(user.id)
        )
      }
      return true
    },
    [CreateOrderStateKey.createdOrder]: async () => {
      const orderData = _.get(
        state[CreateOrderStateKey.inputAmountLimit],
        'data',
        null
      )
      if (orderData === null) {
        return false
      }

      const orderInfo = await getOrderInfo(orderData.createdOrderId)
      if (!orderInfo) {
        return false
      }

      if (orderData.orderType === OrderType.BUY) {
        await CreateOrderMessage(msg, user).buyOrderCreated(
          orderInfo.id,
          orderInfo.cryptoCurrencyCode,
          orderInfo.fiatCurrencyCode,
          orderInfo.rate,
          orderInfo.rateType,
          {
            min: orderInfo.minFiatAmount,
            max: orderInfo.maxFiatAmount
          },
          orderInfo.paymentMethodType,
          orderInfo.isActive,
          orderInfo.terms
        )
      } else {
        let paymentFields: string[] = []
        if (orderInfo.paymentMethodId) {
          const pm = await getPaymentFields(orderInfo.paymentMethodId)
          if (pm) {
            paymentFields = pm.fields
          }
        }
        const availableBalance = await getAvailableBalance(
          user.id,
          orderInfo.cryptoCurrencyCode
        )
        const availableBalanceInFiat =
          (await Order.convertToFixedRate(
            orderInfo.rate,
            orderInfo.rateType,
            orderInfo.cryptoCurrencyCode,
            orderInfo.fiatCurrencyCode,
            orderInfo.user.exchangeRateSource
          )) * availableBalance
        await CreateOrderMessage(msg, user).sellOrderCreated(
          orderInfo.id,
          orderInfo.cryptoCurrencyCode,
          orderInfo.fiatCurrencyCode,
          orderInfo.rate,
          orderInfo.rateType,
          availableBalanceInFiat,
          {
            max: orderInfo.maxFiatAmount,
            min: orderInfo.minFiatAmount
          },
          await getAvailableBalance(user.id, orderInfo.cryptoCurrencyCode),
          orderInfo.paymentMethodType,
          paymentFields,
          orderInfo.isActive,
          orderInfo.terms
        )
      }
      return true
    }
  }

  return resp[state.currentStateKey as CreateOrderStateKey]()
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

async function getOrderInfo(orderId: number) {
  return await Order.getOrder(orderId)
}

async function getAddedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}

async function getPaymentFields(id: number) {
  return await PaymentMethod.getPaymentMethod(id)
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
): Promise<number> {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}
