import { MyOrdersStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { MyOrdersMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import {
  PaymentMethods,
  PaymentMethodsFieldsLocale
} from 'constants/paymentMethods'
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
      await MyOrdersMessage(msg, user).showEditPaymentMethod(Object.keys(
        PaymentMethods
      ) as PaymentMethods[])
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
      return false
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
      if (order.createdBy == user.id) {
        if (order.orderType === OrderType.BUY) {
          await MyOrdersMessage(msg, user).showMyBuyOrder(
            orderId,
            order.cryptoCurrencyCode,
            order.rate,
            order.amount,
            order.paymentMethod,
            order.isEnabled,
            order.terms,
            false,
            false
          )
        } else {
          await MyOrdersMessage(msg, user).showMySellOrder(
            orderId,
            order.cryptoCurrencyCode,
            order.rate,
            order.amount,
            await getAvailableBalance(user.id),
            order.paymentMethod,
            order.paymentMethodFields,
            order.isEnabled,
            order.terms,
            false,
            false
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
  return {
    orderId,
    orderType: OrderType.SELL,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    rate: 382000,
    amount: {
      min: 0.1,
      max: 0.5
    },
    paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
    paymentMethodFields: ['Axis', '21321313', 'AX098098'],
    isEnabled: true,
    terms: null,
    createdBy: 1
  }
}

async function getAvailableBalance(_userId: number) {
  return 0.2
}

async function getActiveOrders(userId: number) {
  return [
    {
      createdBy: userId,
      orderType: OrderType.SELL,
      paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 1
    },
    {
      createdBy: userId,
      orderType: OrderType.SELL,
      paymentMethod: PaymentMethods.CASH,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 2
    },
    {
      createdBy: 219038,
      paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
      orderType: OrderType.SELL,
      rate: 430000,
      fiatCurrencyCode: FiatCurrency.INR,
      orderId: 3
    },
    {
      createdBy: 219038,
      paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
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
