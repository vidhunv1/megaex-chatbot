import { CreateOrderStateKey, CreateOrderError } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import { OrderType } from 'models'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'

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
              valueType: 'margin',
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
              valueType: 'fixed',
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

      if (orderType == null || rateInput == null || !msg.text) {
        return null
      }

      let min, max

      if (msg.text.includes('-')) {
        const [a, b] = msg.text.split('-')
        min = parseFloat(a.replace(/[^\d\.]/g, '')) || 0
        max = parseFloat(b.replace(/[^\d\.]/g, '')) || 0
      } else {
        min = 0
        max = parseFloat(msg.text.replace(/[^\d\.]/g, '')) || 0
      }
      if (max <= 0) {
        return state
      }

      let orderId: number | null = null
      orderId = await createOrder(
        orderType,
        min,
        max,
        rateInput.valueType,
        rateInput.value
      )

      if (orderId != null) {
        return {
          ...state,
          [CreateOrderStateKey.inputAmountLimit]: {
            data: {
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
        return CreateOrderStateKey.inputAmountLimit
      } else {
        return CreateOrderStateKey.inputRate
      }
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
  _orderType: OrderType,
  _minAmount: number,
  _maxAmount: number,
  _rateType: 'fixed' | 'margin',
  _rateValue: number
): Promise<number | null> {
  return 12234
}
