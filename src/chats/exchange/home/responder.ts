import { ExchangeHomeStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { ExchangeHomeMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { ExchangeSource } from 'constants/exchangeSource'
import { Market, Order, Trade } from 'models'

const CURRENT_CRYPTOCURRENCY_CODE = CryptoCurrency.BTC

export const ExchangeHomeResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<ExchangeHomeStateKey, () => Promise<boolean>> = {
    [ExchangeHomeStateKey.start]: async () => {
      return false
    },

    [ExchangeHomeStateKey.exchange]: async () => {
      await ExchangeHomeMessage(msg, user).showExchangeHome(
        await getActiveOrdersCount(user.id),
        await getMarketRate(
          CURRENT_CRYPTOCURRENCY_CODE,
          user.currencyCode,
          user.exchangeRateSource
        ),
        user.currencyCode,
        user.exchangeRateSource
      )
      return true
    }
  }

  return resp[currentState.currentStateKey as ExchangeHomeStateKey]()
}

async function getActiveOrdersCount(userId: number) {
  const myOrders = await Order.getOrders(userId)
  const myOrdersCount = myOrders ? myOrders.length : 0
  const myTrades = await Trade.getUserTrades(userId)
  const myTradesCount = myTrades ? myTrades.length : 0

  return myOrdersCount + myTradesCount
}

async function getMarketRate(
  fromCrypto: CryptoCurrency,
  toFiat: FiatCurrency,
  exchangeSource: ExchangeSource
): Promise<number> {
  return await Market.getFiatValue(fromCrypto, toFiat, exchangeSource)
}
