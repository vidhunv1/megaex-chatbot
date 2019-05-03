import { State } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { ExchangeHomeStateKey, ExchangeHomeState } from './home'
import { MyOrdersStateKey, MyOrdersState } from './myOrders'
import { CreateOrderState, CreateOrderStateKey } from './createOrder'
import { DealsStateKey, DealsState } from './deals'

export const EXCHANGE_STATE_LABEL = 'exchange'

export const STATE_EXPIRY = 86400

export type ExchangeStateKey =
  | ExchangeHomeStateKey
  | DealsStateKey
  | MyOrdersStateKey
  | CreateOrderStateKey

export interface ExchangeState
  extends State<ExchangeStateKey>,
    ExchangeHomeState,
    DealsState,
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
