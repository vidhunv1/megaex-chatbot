import { MyOrdersStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import { CryptoCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'
import { OrderStatus } from 'models'
import { MyOrdersMessage } from './messages'

export const MyOrdersParser: Parser<ExchangeState> = async (
  msg,
  user,
  tUser,
  state
) => {
  const parser: Record<
    MyOrdersStateKey,
    () => Promise<ExchangeState | null>
  > = {
    [MyOrdersStateKey.cb_myOrders]: async () => {
      return state
    },
    [MyOrdersStateKey.myOrders_show]: async () => {
      return state
    },
    [MyOrdersStateKey.cb_deleteOrder]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_editAmount]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_editOrder]: async () => {
      const orderId = _.get(
        state[MyOrdersStateKey.cb_editOrder],
        'orderId',
        null
      )
      if (orderId === null) {
        return null
      }

      const orderInfo = await getOrderInfo(orderId)

      await MyOrdersMessage(msg, user).showBuyOrder(
        orderInfo.orderId,
        orderInfo.cryptoCurrencyCode,
        orderInfo.rate,
        orderInfo.amount,
        orderInfo.paymentMethod,
        orderInfo.status,
        orderInfo.terms,
        true,
        true
      )
      return state
    },
    [MyOrdersStateKey.cb_editPaymentMethod]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_editRate]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_editTerms]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_showOrder_back]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_toggleActive]: async () => {
      return null
    }
  }

  const updatedState = await parser[state.currentStateKey as MyOrdersStateKey]()
  const nextStateKey = nextMyOrdersState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextMyOrdersState(
  state: ExchangeState | null
): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case MyOrdersStateKey.cb_myOrders:
      return MyOrdersStateKey.myOrders_show
    case MyOrdersStateKey.cb_editOrder:
      return MyOrdersStateKey.cb_editOrder
    case MyOrdersStateKey.myOrders_show:
      return null
    default:
      return null
  }
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
    paymentMethod: PaymentMethods.BANK_TRANSFER_INR,
    status: OrderStatus.ACTIVE,
    terms: null
  }
}
