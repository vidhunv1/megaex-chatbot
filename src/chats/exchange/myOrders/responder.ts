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
  PaymentMethodFields
} from 'models'
import { OrderType } from 'models'
import logger from 'modules/Logger'

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
      await MyOrdersMessage(msg, user).showActiveOrders(
        await getActiveOrders(user.id)
      )
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
        user.currencyCode
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
        user.currencyCode
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
              min: order.minAmount,
              max: order.maxAmount
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
          await MyOrdersMessage(msg, user).showMySellOrder(
            orderId,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.rate,
            order.rateType,
            {
              min: order.minAmount,
              max: order.maxAmount
            },
            await getAvailableBalance(user.id),
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
    }
  }

  return resp[state.currentStateKey as MyOrdersStateKey]()
}

async function getOrderInfo(orderId: number) {
  return await Order.getOrder(orderId)
}

async function getAvailableBalance(_userId: number) {
  return 0.2
}

async function getPaymentFields(id: number) {
  return await PaymentMethod.getPaymentMethod(id)
}

async function getAddedPaymentMethods(
  userId: number
): Promise<PaymentMethodFields[]> {
  return await PaymentMethod.getSavedPaymentMethods(userId)
}

async function getActiveOrders(userId: number) {
  return [
    {
      createdBy: userId,
      orderType: OrderType.SELL,
      paymentMethod: PaymentMethodType.BANK_TRANSFER_IMPS_INR,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 1
    },
    {
      createdBy: userId,
      orderType: OrderType.SELL,
      paymentMethod: PaymentMethodType.CASH,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 2
    },
    {
      createdBy: 219038,
      paymentMethod: PaymentMethodType.BANK_TRANSFER_IMPS_INR,
      orderType: OrderType.SELL,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 3
    },
    {
      createdBy: 219038,
      paymentMethod: PaymentMethodType.BANK_TRANSFER_IMPS_INR,
      orderType: OrderType.BUY,
      rate: 420000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 3
    }
  ]
}

async function getMarketRate(
  _cryptocurrency: CryptoCurrency,
  _fiatCurrency: FiatCurrency
): Promise<number> {
  return 400000
}
