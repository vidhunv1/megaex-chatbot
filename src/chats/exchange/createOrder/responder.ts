import { CreateOrderStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { CreateOrderMessage } from './messages'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { OrderType } from 'models'
import { ExchangeSource } from 'constants/exchangeSource'

const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

export const CreateOrderResponder: Responder<ExchangeState> = (
  msg,
  user,
  state
) => {
  const resp: Record<CreateOrderStateKey, () => Promise<boolean>> = {
    [CreateOrderStateKey.cb_showCreateOrder]: async () => {
      return false
    },
    [CreateOrderStateKey.createOrder_show]: async () => {
      await CreateOrderMessage(msg, user).showCreateOrderMessage()
      return true
    },
    [CreateOrderStateKey.cb_createNewOrder]: async () => {
      return false
    },
    [CreateOrderStateKey.createOrderError]: async () => {
      const error = _.get(
        // @ts-ignore
        state[state.previousStateKey],
        `error`,
        null
      )
      if (error == null) {
        return false
      } else {
        CreateOrderMessage(msg, user).showCreateOrderError(error)
        return true
      }
    },
    [CreateOrderStateKey.cb_useMarginPrice]: async () => {
      return false
    },
    [CreateOrderStateKey.cb_useFixedPrice]: async () => {
      return false
    },

    [CreateOrderStateKey.inputRate]: async () => {
      if (state.previousStateKey === CreateOrderStateKey.cb_useMarginPrice) {
        await CreateOrderMessage(msg, user).inputRateMarginPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          await getMarketRateSource(),
          true
        )
      } else if (
        state.previousStateKey === CreateOrderStateKey.cb_useFixedPrice
      ) {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          true
        )
      } else {
        await CreateOrderMessage(msg, user).inputRateFixedPrice(
          CURRENT_CRYPTOCURRENCY,
          await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode),
          OrderType.BUY,
          false
        )
      }
      return true
    },
    [CreateOrderStateKey.inputAmountLimit]: async () => {
      await CreateOrderMessage(msg, user).inputLimits(
        await getMarketRate(CURRENT_CRYPTOCURRENCY, user.currencyCode)
      )
      return true
    },
    [CreateOrderStateKey.createdOrder]: async () => {
      await CreateOrderMessage(msg, user).buyOrderCreated()
      return true
    }
  }

  return resp[state.currentStateKey as CreateOrderStateKey]()
}

async function getMarketRate(
  _cryptocurrency: CryptoCurrency,
  _fiatCurrency: FiatCurrency
): Promise<number> {
  return 400000
}

async function getMarketRateSource(): Promise<ExchangeSource> {
  return ExchangeSource.BINANCE
}
