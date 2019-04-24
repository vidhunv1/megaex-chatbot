import { State } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { ExchangeHomeStateKey, ExchangeHomeState } from './home'
import { BuyState, BuyStateKey } from './buy'
import { SellState, SellStateKey } from './sell'
import { MyOrdersStateKey, MyOrdersState } from './myOrders'
import { CreateOrderState, CreateOrderStateKey } from './createOrder'

export const EXCHANGE_STATE_LABEL = 'exchange'

export const STATE_EXPIRY = 86400

export type ExchangeStateKey =
  | ExchangeHomeStateKey
  | BuyStateKey
  | SellStateKey
  | MyOrdersStateKey
  | CreateOrderStateKey

export interface ExchangeState
  extends State<ExchangeStateKey>,
    ExchangeHomeState,
    BuyState,
    SellState,
    MyOrdersState,
    CreateOrderState {}

export const initialState: ExchangeState = Object.freeze({
  currentStateKey: ExchangeHomeStateKey.start,
  previousStateKey: null,
  key: EXCHANGE_STATE_LABEL
})

export async function updateNextExchangeState(
  updatedState: ExchangeState | null,
  nextStateKey: ExchangeStateKey | null,
  telegramId: number
): Promise<ExchangeState | null> {
  return await moveToNextState<ExchangeStateKey>(
    updatedState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
