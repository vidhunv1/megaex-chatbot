import { MyOrdersStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { MyOrdersMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'

const CURRENT_CRYPTOCURRENCY_CODE = CryptoCurrency.BTC
export const MyOrdersResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<MyOrdersStateKey, () => Promise<boolean>> = {
    [MyOrdersStateKey.cb_myOrders]: async () => {
      return false
    },
    [MyOrdersStateKey.myOrders_show]: async () => {
      await MyOrdersMessage(msg, user).showMyOrdersMessage()
      return true
    },
    [MyOrdersStateKey.cb_deleteOrder]: async () => {
      return false
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
    }
  }

  return resp[currentState.currentStateKey as MyOrdersStateKey]()
}

async function getMarketRate(
  _cryptocurrency: CryptoCurrency,
  _fiatCurrency: FiatCurrency
): Promise<number> {
  return 400000
}
