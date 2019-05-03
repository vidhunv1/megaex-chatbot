import { DealsStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { Deals } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'
import { OrderType } from 'models'
import { DealsConfig } from './config'

const CURRENT_CRYPTOCURRENCY_CODE = CryptoCurrency.BTC

export const DealsResponder: Responder<ExchangeState> = (msg, user, state) => {
  const resp: Record<DealsStateKey, () => Promise<boolean>> = {
    [DealsStateKey.cb_deals]: async () => {
      return false
    },
    [DealsStateKey.deals_show]: async () => {
      const cursor = _.get(state[DealsStateKey.deals_show], 'data.cursor', 0)
      const shouldEdit = _.get(
        state[DealsStateKey.deals_show],
        'data.shouldEdit',
        false
      ) as boolean
      const orderType = _.get(state[DealsStateKey.cb_deals], 'orderType', null)
      if (orderType === null) {
        return false
      }

      const { orderList, totalOrders } = await getOrdersList(
        orderType,
        user.currencyCode,
        cursor,
        DealsConfig.LIST_LIMIT
      )

      await Deals(msg, user).showDealsMessage(
        CURRENT_CRYPTOCURRENCY_CODE,
        orderType,
        orderList,
        totalOrders,
        cursor,
        shouldEdit
      )
      return true
    },
    [DealsStateKey.cb_prevDeals]: async () => {
      return false
    },
    [DealsStateKey.cb_nextDeals]: async () => {
      return false
    },
    [DealsStateKey.cb_showDealById]: async () => {
      return false
    },
    [DealsStateKey.showDealById]: async () => {
      return false
    }
  }

  return resp[state.currentStateKey as DealsStateKey]()
}

async function getOrdersList(
  orderType: OrderType,
  fiatCurrencyCode: FiatCurrency,
  cursor: number,
  limit: number
) {
  const orders = [
    {
      orderId: 1,
      cryptoCurrencyCode: CryptoCurrency.BTC,
      fiatCurrencyCode: fiatCurrencyCode,
      rate: 310001,
      rating: 4.0,
      amount: {
        min: 0.3,
        max: 0.5
      },
      paymentMethod: PaymentMethods.BANK_TRANSFER_IMPS_INR,
      isEnabled: true,
      terms: 'Please transfer fast..'
    },
    {
      orderId: 4,
      cryptoCurrencyCode: CryptoCurrency.BTC,
      fiatCurrencyCode: fiatCurrencyCode,
      rate: 310004,
      rating: 4.6,
      amount: {
        min: 0.1,
        max: 0.5
      },
      paymentMethod: PaymentMethods.UPI,
      isEnabled: true,
      terms: 'Please transfer fast..'
    },
    {
      orderId: 3,
      cryptoCurrencyCode: CryptoCurrency.BTC,
      fiatCurrencyCode: FiatCurrency.INR,
      rate: 310003,
      rating: 4.7,
      amount: {
        min: 0.1,
        max: 0.5
      },
      paymentMethod: PaymentMethods.PAYTM,
      isEnabled: true,
      terms: 'Please transfer fast..'
    },
    {
      orderId: 2,
      cryptoCurrencyCode: CryptoCurrency.BTC,
      fiatCurrencyCode: fiatCurrencyCode,
      rate: 310002,
      rating: 4.9,
      amount: {
        min: 0.1,
        max: 0.5
      },
      paymentMethod: PaymentMethods.CASH,
      isEnabled: true,
      terms: 'Please transfer fast..'
    }
  ]

  const a = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
  a.forEach((id) =>
    orders.push({
      orderId: id,
      cryptoCurrencyCode: CryptoCurrency.BTC,
      fiatCurrencyCode: fiatCurrencyCode,
      rate: 310000 + id,
      rating: 4.6,
      amount: {
        min: 0.1,
        max: 0.5
      },
      paymentMethod: PaymentMethods.UPI,
      isEnabled: true,
      terms: 'Please transfer fast..'
    })
  )

  const orderList = _.orderBy(orders, (o) => o.rate, [
    orderType === OrderType.BUY ? 'asc' : 'desc'
  ]).slice(cursor, cursor + limit)

  return { orderList, totalOrders: orders.length }
}
