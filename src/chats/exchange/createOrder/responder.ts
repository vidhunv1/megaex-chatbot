import { CreateOrderStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { CreateOrderMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { OrderType } from 'models'
import { ExchangeSource } from 'constants/exchangeSource'
import { PaymentMethods } from 'constants/paymentMethods'

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
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          await getMarketRateSource(),
          true
        )
      } else if (
        state.previousStateKey === CreateOrderStateKey.cb_useFixedPrice
      ) {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          true
        )
      } else {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          false
        )
      }
      return true
    },
    [CreateOrderStateKey.inputAmountLimit]: async () => {
      await CreateOrderMessage(msg, user).inputLimits(
        await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode)
      )
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
        await CreateOrderMessage(msg, user).selectBuyPaymentMethod(Object.keys(
          PaymentMethods
        ) as PaymentMethods[])
      } else {
        await CreateOrderMessage(msg, user).selectSellPaymentMethod(
          Object.keys(PaymentMethods) as PaymentMethods[],
          await getAddedPaymentMethods()
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

      if (orderData.orderType === OrderType.BUY) {
        await CreateOrderMessage(msg, user).buyOrderCreated(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          orderInfo.paymentMethod,
          orderInfo.isEnabled,
          orderInfo.terms
        )
      } else {
        await CreateOrderMessage(msg, user).sellOrderCreated(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          await getAvailableBalance(orderInfo.cryptoCurrencyCode),
          orderInfo.paymentMethod,
          orderInfo.paymentMethodFields,
          orderInfo.isEnabled,
          orderInfo.terms
        )
      }
      return true
    }
  }

  return resp[state.currentStateKey as CreateOrderStateKey]()
}

async function getMarketRate(
  _cryptocurrency: CryptoCurrency,
  _fiatCurrency: FiatCurrency
): Promise<number> {
  return 400000
}

async function getMarketRateSource(): Promise<ExchangeSource> {
  return ExchangeSource.BINANCE
}

async function getOrderInfo(orderId: number) {
  return {
    orderId,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    rate: 382000,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
    paymentMethodFields: [],
    isEnabled: true,
    terms: null
  }
}

interface PaymentMethodDetails {
  paymentMethod: PaymentMethods
  fields: string[]
  id: number
}

async function getAddedPaymentMethods(): Promise<PaymentMethodDetails[]> {
  return [
    {
      paymentMethod: PaymentMethods.PAYTM,
      fields: ['91 9113869518'],
      id: 1
    },
    {
      paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
      fields: ['Axis bank', '1982731289371', 'AX001211'],
      id: 2
    }
  ]
}

async function getAvailableBalance(
  _currencyCode: CryptoCurrency
): Promise<number> {
  return 0.1
}
