import telegramHook from 'modules/TelegramHook'
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
import { RateTypes, OrderType } from 'models'
import { MyOrdersMessage } from './messages'
import logger from 'modules/Logger'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'

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
      const orderId = _.get(
        state[MyOrdersStateKey.cb_deleteOrder],
        'orderId',
        null
      )
      if (orderId === null) {
        return null
      }

      await deleteOrder(orderId)

      await telegramHook.getWebhook.editMessageText('- -', {
        message_id: msg.message_id,
        chat_id: msg.chat.id
      })
      return state
    },
    [MyOrdersStateKey.showDeleteSuccess]: async () => {
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

      if (orderInfo.orderType === OrderType.SELL) {
        await MyOrdersMessage(msg, user).showSellOrder(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          await getAvailableBalance(orderInfo.cryptoCurrencyCode),
          orderInfo.paymentMethod,
          [],
          orderInfo.isEnabled,
          orderInfo.terms,
          true,
          true
        )
      } else {
        await MyOrdersMessage(msg, user).showBuyOrder(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          orderInfo.paymentMethod,
          orderInfo.isEnabled,
          orderInfo.terms,
          true,
          true
        )
      }

      return state
    },

    [MyOrdersStateKey.cb_editPaymentDetails]: async () => {
      return null
    },
    [MyOrdersStateKey.editPaymentDetails_show]: async () => {
      return null
    },
    [MyOrdersStateKey.editPaymentDetails_input]: async () => {
      return null
    },

    [MyOrdersStateKey.cb_editPaymentMethod]: async () => {
      return state
    },
    [MyOrdersStateKey.editPaymentMethod_show]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_editPaymentMethodSelected]: async () => {
      const selectedPaymentMethod = _.get(
        state[MyOrdersStateKey.cb_editPaymentMethodSelected],
        'pm',
        null
      )
      if (selectedPaymentMethod === null) {
        return null
      }

      await savePaymentMethod(selectedPaymentMethod)
      return state
    },

    [MyOrdersStateKey.cb_editAmount]: async () => {
      return state
    },
    [MyOrdersStateKey.editAmount_show]: async () => {
      let min, max

      if (!msg.text) {
        return null
      }

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

      await saveEditedAmount(min, max)

      return {
        ...state,
        [MyOrdersStateKey.editAmount_show]: {
          data: {
            maxAmount: max,
            minAmount: min
          }
        }
      }
    },

    [MyOrdersStateKey.cb_editRate]: async () => {
      return state
    },
    [MyOrdersStateKey.editRate_show]: async () => {
      if (!msg.text) {
        return null
      }

      const parsed = parseCurrencyAmount(msg.text, user.currencyCode)
      if (msg.text.includes('%')) {
        const valueType = RateTypes.MARGIN
        const value = parseFloat(msg.text.replace(/[^\d\.]/g, ''))
        await saveEditedRate(valueType, value)

        return {
          ...state,
          [MyOrdersStateKey.editRate_show]: {
            data: {
              value,
              valueType
            }
          }
        }
      } else if (parsed && parsed.amount > 0) {
        const valueType = RateTypes.FIXED
        const value = parsed.amount
        await saveEditedRate(valueType, value)

        return {
          ...state,
          [MyOrdersStateKey.editRate_show]: {
            data: {
              valueType,
              value
            }
          }
        }
      }

      return state
    },

    [MyOrdersStateKey.cb_editTerms]: async () => {
      return state
    },
    [MyOrdersStateKey.editTerms_show]: async () => {
      if (!msg.text) {
        return null
      }

      const TERMS_CHARACTER_LIMIT = 300
      const terms = msg.text.substring(0, TERMS_CHARACTER_LIMIT)
      await saveEditedTerms(terms)
      return {
        ...state,
        [MyOrdersStateKey.editTerms_show]: {
          data: {
            terms
          }
        }
      }
    },

    [MyOrdersStateKey.cb_showOrder_back]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_toggleActive]: async () => {
      const isEnabled = _.get(
        state[MyOrdersStateKey.cb_toggleActive],
        'isEnabled',
        null
      )
      const orderId = _.get(
        state[MyOrdersStateKey.cb_toggleActive],
        'orderId',
        null
      )
      if (isEnabled === null || orderId === null) {
        return null
      }

      const orderInfo = await saveActive(JSON.parse(isEnabled + ''))

      if (orderInfo.orderType === OrderType.SELL) {
        await MyOrdersMessage(msg, user).showSellOrder(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          await getAvailableBalance(orderInfo.cryptoCurrencyCode),
          orderInfo.paymentMethod,
          [],
          orderInfo.isEnabled,
          orderInfo.terms,
          true,
          true
        )
      } else {
        await MyOrdersMessage(msg, user).showBuyOrder(
          orderInfo.orderId,
          orderInfo.cryptoCurrencyCode,
          orderInfo.rate,
          orderInfo.amount,
          orderInfo.paymentMethod,
          orderInfo.isEnabled,
          orderInfo.terms,
          true,
          true
        )
      }

      return state
    },
    [MyOrdersStateKey.showEditSuccess]: async () => {
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

    case MyOrdersStateKey.cb_editRate:
      return MyOrdersStateKey.editRate_show
    case MyOrdersStateKey.editRate_show: {
      const data = _.get(state[MyOrdersStateKey.editRate_show], 'data', null)
      if (data === null) {
        return MyOrdersStateKey.editRate_show
      }
      return MyOrdersStateKey.showEditSuccess
    }

    case MyOrdersStateKey.cb_editAmount:
      return MyOrdersStateKey.editAmount_show
    case MyOrdersStateKey.editAmount_show: {
      const data = _.get(state[MyOrdersStateKey.editAmount_show], 'data', null)
      if (data === null) {
        return MyOrdersStateKey.editAmount_show
      }
      return MyOrdersStateKey.showEditSuccess
    }

    case MyOrdersStateKey.cb_editTerms:
      return MyOrdersStateKey.editTerms_show
    case MyOrdersStateKey.editTerms_show: {
      const data = _.get(state[MyOrdersStateKey.editTerms_show], 'data', null)
      if (data === null) {
        return MyOrdersStateKey.editTerms_show
      }
      return MyOrdersStateKey.showEditSuccess
    }

    case MyOrdersStateKey.cb_editPaymentMethod:
      return MyOrdersStateKey.editPaymentMethod_show
    case MyOrdersStateKey.cb_editPaymentMethodSelected: {
      const seleceted = _.get(
        state[MyOrdersStateKey.cb_editPaymentMethodSelected],
        'pm',
        null
      )
      if (seleceted === null) {
        return null
      }
      return MyOrdersStateKey.showEditSuccess
    }

    case MyOrdersStateKey.cb_toggleActive:
      return MyOrdersStateKey.showEditSuccess

    case MyOrdersStateKey.cb_deleteOrder:
      return MyOrdersStateKey.showDeleteSuccess
    default:
      return null
  }
}

const MOCK_ORDER = {
  orderId: 213213,
  orderType: OrderType.SELL,
  cryptoCurrencyCode: CryptoCurrency.BTC,
  rate: 382000,
  amount: {
    min: 0.1,
    max: 0.5
  },
  paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
  isEnabled: true,
  terms: null
}

async function getAvailableBalance(
  _currencyCode: CryptoCurrency
): Promise<number> {
  return 0
}

async function getOrderInfo(orderId: number) {
  return {
    ...MOCK_ORDER,
    orderId
  }
}

async function saveEditedRate(valueType: RateTypes, value: number) {
  logger.error('TODO: implement saveEditedrate')
  return {
    ...MOCK_ORDER,
    rate: {
      value,
      valueType
    }
  }
}

async function saveEditedAmount(min: number, max: number) {
  logger.error('TODO: implement saveEditedAmount')
  return {
    ...MOCK_ORDER,
    amount: {
      min,
      max
    }
  }
}

async function saveEditedTerms(terms: string) {
  logger.error('TODO: implement saveEditedTerms')
  return {
    ...MOCK_ORDER,
    terms
  }
}

async function savePaymentMethod(paymentMethod: PaymentMethods) {
  logger.error('TODO: implement savePaymentMethod')
  return {
    ...MOCK_ORDER,
    paymentMethod
  }
}

async function saveActive(isEnabled: boolean) {
  logger.error('TODO: implement saveActive ' + isEnabled)
  return {
    ...MOCK_ORDER,
    isEnabled: !isEnabled
  }
}

async function deleteOrder(orderId: number): Promise<boolean> {
  logger.error('TODO: implement delete order ' + orderId)
  return true
}
