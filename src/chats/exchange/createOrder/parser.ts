import { CreateOrderStateKey, CreateOrderError } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import { OrderType, RateType, Order } from 'models'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { PaymentMethodType } from 'models'
import {
  CryptoCurrency,
  FiatCurrency,
  cryptoCurrencyInfo
} from 'constants/currencies'
import logger from 'modules/Logger'

const CURRENT_CRYPTO_CURRENCY_CODE = CryptoCurrency.BTC

export const CreateOrderParser: Parser<ExchangeState> = async (
  msg,
  user,
  tUser,
  state
) => {
  const parser: Record<
    CreateOrderStateKey,
    () => Promise<ExchangeState | null>
  > = {
    [CreateOrderStateKey.cb_showCreateOrder]: async () => {
      return state
    },
    [CreateOrderStateKey.createOrder_show]: async () => {
      return null
    },
    [CreateOrderStateKey.cb_createNewOrder]: async () => {
      return state
    },
    [CreateOrderStateKey.cb_useMarginPrice]: async () => {
      return state
    },
    [CreateOrderStateKey.cb_useFixedPrice]: async () => {
      return state
    },
    [CreateOrderStateKey.createOrderError]: async () => {
      return null
    },

    [CreateOrderStateKey.inputRate]: async () => {
      const orderType = _.get(
        state[CreateOrderStateKey.cb_createNewOrder],
        'orderType',
        null
      )
      if (!msg.text || orderType == null) {
        return null
      }

      const parsed = parseCurrencyAmount(msg.text, user.currencyCode)
      if (msg.text.includes('%')) {
        return {
          ...state,
          [CreateOrderStateKey.inputRate]: {
            orderType,
            data: {
              valueType: RateType.MARGIN,
              value: parseFloat(msg.text.replace(/[^\d\.]/g, ''))
            }
          }
        }
      } else if (parsed && parsed.amount > 0) {
        return {
          ...state,
          [CreateOrderStateKey.inputRate]: {
            orderType,
            data: {
              valueType: RateType.FIXED,
              value: parsed.amount
            }
          }
        }
      }

      return state
    },
    [CreateOrderStateKey.inputAmountLimit]: async () => {
      const orderType = _.get(
        state[CreateOrderStateKey.cb_createNewOrder],
        'orderType',
        null
      )
      const rateInput = _.get(
        state[CreateOrderStateKey.inputRate],
        'data',
        null
      )
      const paymentMethod = _.get(
        state[CreateOrderStateKey.cb_selectPaymentMethod],
        'pm'
      )

      if (
        orderType == null ||
        rateInput == null ||
        paymentMethod == null ||
        !msg.text
      ) {
        return null
      }

      let min, max

      if (msg.text.includes('-')) {
        const [a, b] = msg.text.split('-')
        min = parseFloat(a.replace(/[^\d\.]/g, '')) || 0
        max = parseFloat(b.replace(/[^\d\.]/g, '')) || 0
      } else {
        min = await getDefaultMin(user.currencyCode)
        max = parseFloat(msg.text.replace(/[^\d\.]/g, '')) || 0
      }
      if (max <= 0 || min > max) {
        return state
      }

      let orderId: number | null = null
      const pmid = _.get(
        state[CreateOrderStateKey.cb_selectPaymentMethod],
        'pmId',
        null
      )
      orderId = await createOrder(
        user.id,
        orderType,
        min,
        max,
        rateInput.valueType,
        rateInput.value,
        paymentMethod,
        pmid != null ? JSON.parse(pmid + '') : null,
        CURRENT_CRYPTO_CURRENCY_CODE,
        user.currencyCode
      )

      if (orderId != null) {
        return {
          ...state,
          [CreateOrderStateKey.inputAmountLimit]: {
            data: {
              orderType,
              minAmount: min,
              maxAmount: max,
              createdOrderId: orderId
            },
            error: null
          }
        }
      }

      return {
        ...state,
        [CreateOrderStateKey.inputAmountLimit]: {
          data: null,
          error: CreateOrderError.ERROR_CREATE_BUY_ORDER
        }
      }
    },
    [CreateOrderStateKey.createdOrder]: async () => {
      return null
    },
    [CreateOrderStateKey.cb_selectPaymentMethod]: async () => {
      return state
    },
    [CreateOrderStateKey.selectPaymentMethod]: async () => {
      return state
    }
  }

  const updatedState = await parser[
    state.currentStateKey as CreateOrderStateKey
  ]()
  const nextStateKey = nextCreateOrderState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextCreateOrderState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }
  switch (state.currentStateKey) {
    case CreateOrderStateKey.inputRate: {
      const data = _.get(state[CreateOrderStateKey.inputRate], 'data', null)
      if (data != null && data.value != null) {
        return CreateOrderStateKey.selectPaymentMethod
      } else {
        return CreateOrderStateKey.inputRate
      }
    }

    case CreateOrderStateKey.cb_selectPaymentMethod: {
      const selectedPm = _.get(
        state[CreateOrderStateKey.cb_selectPaymentMethod],
        'pm',
        null
      )
      if (selectedPm == null) {
        return null
      }

      return CreateOrderStateKey.inputAmountLimit
    }

    case CreateOrderStateKey.inputAmountLimit: {
      const isErrored = _.get(
        state[CreateOrderStateKey.inputAmountLimit],
        'error',
        null
      )
      if (isErrored != null) {
        return CreateOrderStateKey.createOrderError
      }

      const createdOrder = _.get(
        state[CreateOrderStateKey.inputAmountLimit],
        'data',
        null
      )

      if (createdOrder && createdOrder.createdOrderId) {
        return CreateOrderStateKey.createdOrder
      } else {
        return CreateOrderStateKey.inputAmountLimit
      }
    }

    case CreateOrderStateKey.cb_showCreateOrder:
      return CreateOrderStateKey.createOrder_show

    case CreateOrderStateKey.createOrder_show:
      return null

    case CreateOrderStateKey.cb_createNewOrder: {
      const orderType = _.get(
        state[CreateOrderStateKey.cb_createNewOrder],
        'orderType',
        null
      )
      if (!orderType) {
        return null
      }

      return CreateOrderStateKey.inputRate
    }

    case CreateOrderStateKey.cb_useMarginPrice:
      return CreateOrderStateKey.inputRate
    case CreateOrderStateKey.cb_useFixedPrice:
      return CreateOrderStateKey.inputRate

    default:
      return null
  }
}

async function createOrder(
  userId: number,
  orderType: OrderType,
  minAmount: number,
  maxAmount: number,
  rateType: RateType,
  rateValue: number,
  paymentMethod: PaymentMethodType,
  addedPaymentMethodId: number | null,
  cryptoCurrencyCode: CryptoCurrency,
  fiatCurrencyCode: FiatCurrency
): Promise<number | null> {
  try {
    const order = await Order.createOrder(
      userId,
      orderType,
      rateValue,
      rateType,
      minAmount,
      maxAmount,
      cryptoCurrencyCode,
      fiatCurrencyCode,
      paymentMethod,
      addedPaymentMethodId
    )

    if (order) {
      return order.id
    }
    return null
  } catch (e) {
    return null
  }
}

async function getDefaultMin(fiatCode: FiatCurrency) {
  logger.error('getDefaultMin amount')
  const marketRate = await getMarketRate(fiatCode, CURRENT_CRYPTO_CURRENCY_CODE)
  return (
    marketRate * cryptoCurrencyInfo[CURRENT_CRYPTO_CURRENCY_CODE].minBuyAmount
  )
}

async function getMarketRate(
  _fiatCode: FiatCurrency,
  _to: CryptoCurrency
): Promise<number> {
  logger.error('Get market rate')
  return 400000
}
