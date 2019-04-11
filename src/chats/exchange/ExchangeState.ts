import { State, StateFlow } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { PaymentMethods } from 'constants/paymentMethods'

export const EXCHANGE_STATE_KEY = 'exchange'

export interface IExchangeState {
  start?: boolean
  exchange?: boolean
  // BUY
  buy?: boolean
  buyAmount?: number
  buyPrice?: number
  buyLimit?: { max: number; min: number }
  buyPaymentMethods?: [PaymentMethods]
}

export interface ExchangeState extends State<IExchangeState>, IExchangeState {}

export const exchangeFlow: StateFlow<IExchangeState> = {
  start: 'exchange',
  exchange: null,
  buy: 'buyAmount',
  buyAmount: 'buyLimit',
  buyLimit: 'buyPrice',
  buyPrice: 'buyPaymentMethods',
  buyPaymentMethods: null
}

export const initialState: ExchangeState = {
  currentMessageKey: 'start',
  key: EXCHANGE_STATE_KEY
}

export async function nextExchangeState(
  currentState: ExchangeState,
  telegramId: number
): Promise<ExchangeState | null> {
  return await moveToNextState<ExchangeState>(
    currentState,
    exchangeFlow,
    telegramId
  )
}
