import { telegramHook } from 'modules'
import { MyOrdersStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import {
  CryptoCurrency,
  FiatCurrency,
  cryptoCurrencyInfo
} from 'constants/currencies'
import { PaymentMethodsFieldsLocale } from 'constants/paymentMethods'
import PaymentMethod, { PaymentMethodType } from 'models/PaymentMethod'
import { RateType, OrderType, Order, Transaction, Market } from 'models'
import { MyOrdersMessage } from './messages'
import { logger } from 'modules'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { ExchangeSource } from 'constants/exchangeSource'

const CURRENT_CRYPTO_CURRENCY_CODE = CryptoCurrency.BTC

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
    [MyOrdersStateKey.cb_showActiveOrders]: async () => {
      return state
    },
    [MyOrdersStateKey.showActiveOrders]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_showOrderById]: async () => {
      return state
    },
    [MyOrdersStateKey.showOrderById]: async () => {
      return null
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
      if (!orderInfo) {
        logger.error('Order info null in cb_editOrder')
        return null
      }

      if (orderInfo && orderInfo.orderType === OrderType.SELL) {
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
        await MyOrdersMessage(msg, user).showMySellOrder(
          orderInfo.id,
          orderInfo.cryptoCurrencyCode,
          orderInfo.fiatCurrencyCode,
          orderInfo.rate,
          orderInfo.rateType,
          availableBalanceInFiat,
          {
            min: orderInfo.minFiatAmount,
            max: orderInfo.maxFiatAmount
          },
          availableBalance,
          orderInfo.paymentMethodType,
          paymentFields,
          orderInfo.isActive,
          orderInfo.terms,
          true,
          true,
          false
        )
      } else {
        await MyOrdersMessage(msg, user).showMyBuyOrder(
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
          orderInfo.terms,
          true,
          true,
          false
        )
      }

      return state
    },

    [MyOrdersStateKey.cb_editPaymentDetails]: async () => {
      const paymentMethod = _.get(
        state[MyOrdersStateKey.cb_editPaymentDetails],
        'pm',
        null
      )
      if (paymentMethod === null) {
        return null
      }

      return {
        ...state,
        [MyOrdersStateKey.editPaymentDetails_show]: {
          data: {
            paymentMethod,
            fields: []
          }
        }
      }
    },
    [MyOrdersStateKey.editPaymentDetails_show]: async () => {
      const pmDetailsData = _.get(
        state[MyOrdersStateKey.editPaymentDetails_show],
        'data',
        null
      )
      const orderId = _.get(
        state[MyOrdersStateKey.cb_editPaymentDetails],
        'orderId',
        null
      )
      if (pmDetailsData === null || !msg.text || orderId === null) {
        return null
      }

      const fields = pmDetailsData.fields
      fields.push(msg.text)

      if (
        pmDetailsData.fields.length ===
        PaymentMethodsFieldsLocale[pmDetailsData.paymentMethod].length
      ) {
        await editPaymentDetails(
          user.id,
          orderId,
          pmDetailsData.paymentMethod,
          fields
        )
      }

      return {
        ...state,
        [MyOrdersStateKey.editPaymentDetails_show]: {
          data: {
            ...pmDetailsData,
            fields
          }
        }
      }
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
      const pmId =
        parseInt(
          _.get(
            state[MyOrdersStateKey.cb_editPaymentMethodSelected],
            'pmId',
            null
          ) + ''
        ) || null

      const orderId = _.get(
        state[MyOrdersStateKey.cb_editPaymentMethod],
        'orderId',
        null
      )
      if (selectedPaymentMethod === null || orderId === null) {
        return null
      }

      await savePaymentMethod(orderId, selectedPaymentMethod, pmId)
      return state
    },

    [MyOrdersStateKey.cb_editAmount]: async () => {
      return state
    },
    [MyOrdersStateKey.editAmount_show]: async () => {
      const orderId = _.get(
        state[MyOrdersStateKey.cb_editAmount],
        'orderId',
        null
      )
      let min, max

      if (!msg.text || orderId == null) {
        return null
      }

      if (msg.text.includes('-')) {
        const [a, b] = msg.text.split('-')
        min = parseFloat(a.replace(/[^\d\.]/g, '')) || 0
        max = parseFloat(b.replace(/[^\d\.]/g, '')) || 0
      } else {
        min = await getDefaultMin(user.currencyCode, user.exchangeRateSource)
        max = parseFloat(msg.text.replace(/[^\d\.]/g, '')) || 0
      }
      if (max <= 0) {
        return state
      }

      await saveEditedAmount(orderId, min, max)

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
      const orderId = _.get(
        state[MyOrdersStateKey.cb_editRate],
        'orderId',
        null
      )
      if (!msg.text || orderId == null) {
        return null
      }

      const parsed = parseCurrencyAmount(msg.text, user.currencyCode)
      if (msg.text.includes('%')) {
        const valueType = RateType.MARGIN
        const value = parseFloat(msg.text.replace(/[^\d\.]/g, ''))
        await saveEditedRate(orderId, valueType, value)

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
        const valueType = RateType.FIXED
        const value = parsed.amount
        await saveEditedRate(orderId, valueType, value)

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
      const orderId = _.get(
        state[MyOrdersStateKey.cb_editTerms],
        'orderId',
        null
      )
      if (!msg.text || orderId == null) {
        return null
      }

      const TERMS_CHARACTER_LIMIT = 300
      const terms = msg.text.substring(0, TERMS_CHARACTER_LIMIT)
      await saveEditedTerms(orderId, terms)
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
      await telegramHook.getWebhook.deleteMessage(
        msg.chat.id,
        msg.message_id + ''
      )
      return state
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

      await saveActive(orderId, !JSON.parse(isEnabled + ''))
      const orderInfo = await getOrderInfo(orderId)
      if (!orderInfo) {
        return null
      }

      let paymentMethodFields: string[] = []
      if (orderInfo.paymentMethodId) {
        const pm = await getPaymentFields(orderInfo.paymentMethodId)
        if (pm && pm.fields) {
          paymentMethodFields = pm.fields
        }
      }
      if (orderInfo.orderType === OrderType.SELL) {
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
        await MyOrdersMessage(msg, user).showMySellOrder(
          orderInfo.id,
          orderInfo.cryptoCurrencyCode,
          orderInfo.fiatCurrencyCode,
          orderInfo.rate,
          orderInfo.rateType,
          availableBalanceInFiat,
          {
            min: orderInfo.minFiatAmount,
            max: orderInfo.maxFiatAmount
          },
          availableBalance,
          orderInfo.paymentMethodType,
          paymentMethodFields,
          orderInfo.isActive,
          orderInfo.terms,
          true,
          true,
          false
        )
      } else {
        await MyOrdersMessage(msg, user).showMyBuyOrder(
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
          orderInfo.terms,
          true,
          true,
          false
        )
      }

      return state
    },
    [MyOrdersStateKey.showEditSuccess]: async () => {
      return null
    },
    [MyOrdersStateKey.cb_showTradeById]: async () => {
      const tradeId = _.get(
        state[MyOrdersStateKey.cb_showTradeById],
        'tradeId',
        null
      )
      if (!tradeId) {
        return null
      }

      return state
    },
    [MyOrdersStateKey.showTradeById]: async () => {
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
    case MyOrdersStateKey.cb_showActiveOrders:
      return MyOrdersStateKey.showActiveOrders
    case MyOrdersStateKey.showActiveOrders:
      return null
    case MyOrdersStateKey.cb_showOrderById:
      return MyOrdersStateKey.showOrderById
    case MyOrdersStateKey.showOrderById:
      return null

    case MyOrdersStateKey.cb_editOrder:
      return MyOrdersStateKey.cb_editOrder

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

    case MyOrdersStateKey.cb_editPaymentDetails:
      return MyOrdersStateKey.editPaymentDetails_show
    case MyOrdersStateKey.editPaymentDetails_show: {
      const pmDetailsData = _.get(
        state[MyOrdersStateKey.editPaymentDetails_show],
        'data',
        null
      )
      if (pmDetailsData === null) {
        return null
      }

      if (
        pmDetailsData.fields.length ===
        PaymentMethodsFieldsLocale[pmDetailsData.paymentMethod].length
      ) {
        return MyOrdersStateKey.showEditSuccess
      }

      return MyOrdersStateKey.editPaymentDetails_show
    }
    case MyOrdersStateKey.cb_showOrder_back:
      return MyOrdersStateKey.cb_showOrder_back
    case MyOrdersStateKey.cb_showTradeById:
      return MyOrdersStateKey.showTradeById
    default:
      return null
  }
}

async function getOrderInfo(orderId: number) {
  return await Order.getOrder(orderId)
}

async function getPaymentFields(id: number) {
  return await PaymentMethod.getPaymentMethod(id)
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

async function getDefaultMin(
  fiatCode: FiatCurrency,
  exchangeRateSource: ExchangeSource
) {
  const marketRate = await getMarketRate(
    CURRENT_CRYPTO_CURRENCY_CODE,
    fiatCode,
    exchangeRateSource
  )
  return (
    marketRate * cryptoCurrencyInfo[CURRENT_CRYPTO_CURRENCY_CODE].minBuyAmount
  )
}

async function saveEditedRate(
  orderId: number,
  rateType: RateType,
  rate: number
): Promise<void> {
  await Order.editOrder(orderId, {
    rateType,
    rate
  })
}

async function saveEditedAmount(
  orderId: number,
  min: number,
  max: number
): Promise<void> {
  await Order.editOrder(orderId, {
    minFiatAmount: min,
    maxFiatAmount: max
  })
}

async function saveEditedTerms(orderId: number, terms: string): Promise<void> {
  await Order.editOrder(orderId, {
    terms
  })
}

async function saveActive(orderId: number, isActive: boolean) {
  await Order.editOrder(orderId, {
    isActive
  })
}

async function savePaymentMethod(
  orderId: number,
  paymentMethod: PaymentMethodType,
  pmId: number | null
) {
  await Order.editOrder(orderId, {
    paymentMethodType: paymentMethod,
    paymentMethodId: pmId
  })
}

async function editPaymentDetails(
  userId: number,
  orderId: number,
  paymentMethod: PaymentMethodType,
  fields: string[]
) {
  const order = await Order.getOrder(orderId)
  if (!order) {
    return
  }
  let pmId: number
  if (order.paymentMethodId === null) {
    pmId = await PaymentMethod.savePaymentMethod(userId, paymentMethod, fields)
  } else {
    pmId = await PaymentMethod.editPaymentMethod(
      order.paymentMethodId,
      userId,
      paymentMethod,
      fields
    )
  }

  await Order.editOrder(orderId, {
    paymentMethodId: pmId
  })
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
): Promise<number> {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}

async function deleteOrder(orderId: number): Promise<boolean> {
  await Order.deleteOrder(orderId)
  return true
}
