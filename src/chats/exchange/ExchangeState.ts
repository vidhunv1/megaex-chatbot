import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { PaymentMethods } from 'constants/paymentMethods'
import logger from 'modules/Logger'
import { CryptoCurrency } from 'constants/currencies'

export const EXCHANGE_STATE_LABEL = 'exchange'
export enum ExchangeStateKey {
  start = 'start',
  exchange = 'exchange',

  cb_myOrders = 'cb_myOrders',
  cb_createOrder = 'cb_createOrder',

  cb_buy = 'cb_buy',
  buy_amount = 'buy_amount',
  buy_price = 'buy_price',
  buy_limit = 'buy_limit',
  buy_paymentMethods = 'buy_paymentMethods',

  cb_sell = 'sb_sell'
}

export const STATE_EXPIRY = 86400

export interface IExchangeState {
  [ExchangeStateKey.cb_buy]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [ExchangeStateKey.buy_amount]?: {
    data?: {
      amount: number
    }
  }
  [ExchangeStateKey.buy_price]?: {
    data?: {
      price: number
    }
  }
  [ExchangeStateKey.buy_limit]?: {
    data?: {
      max: number
      min: number
    }
  }
  [ExchangeStateKey.buy_paymentMethods]?: {
    data?: {
      paymentMethods: [PaymentMethods]
    }
  }

  [ExchangeStateKey.cb_myOrders]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [ExchangeStateKey.cb_createOrder]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [ExchangeStateKey.cb_sell]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
}

export interface ExchangeState
  extends State<ExchangeStateKey>,
    IExchangeState {}

export function getNextStateKey(
  currentState: ExchangeState | null
): ExchangeStateKey | null {
  if (!currentState) {
    return null
  }
  const stateKey = currentState.currentStateKey

  switch (stateKey) {
    case ExchangeStateKey.start:
      return ExchangeStateKey.exchange
    case ExchangeStateKey.exchange:
      return null
    case ExchangeStateKey.cb_buy:
      return ExchangeStateKey.buy_amount
    case ExchangeStateKey.buy_amount:
      return ExchangeStateKey.buy_limit
    case ExchangeStateKey.buy_price:
      return ExchangeStateKey.buy_paymentMethods
    case ExchangeStateKey.buy_paymentMethods:
      return null

    default:
      logger.error(
        `Unhandled at ExchangeState getNextStateKey ${JSON.stringify(
          currentState
        )}`
      )
      return null
  }
}

export const initialState: ExchangeState = Object.freeze({
  currentStateKey: ExchangeStateKey.start,
  previousStateKey: null,
  key: EXCHANGE_STATE_LABEL
})

export async function nextExchangeState(
  currentState: ExchangeState | null,
  telegramId: number
): Promise<ExchangeState | null> {
  const stateKey = getNextStateKey(currentState)

  return await moveToNextState<ExchangeStateKey>(
    currentState,
    telegramId,
    stateKey,
    STATE_EXPIRY
  )
}
