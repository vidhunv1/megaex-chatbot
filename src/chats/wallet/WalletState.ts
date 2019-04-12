import { State, StateFlow } from 'chats/types'
import { moveToNextState } from 'chats/utils'

export const WALLET_STATE_KEY = 'wallet'

export interface IWalletState {
  start?: boolean
  wallet?: boolean
}

export interface WalletState extends State<IWalletState>, IWalletState {}

export const exchangeFlow: StateFlow<IWalletState> = {
  start: 'wallet',
  wallet: null
}

export const initialState: WalletState = {
  currentMessageKey: 'start',
  key: WALLET_STATE_KEY
}

export async function nextWalletState(
  currentState: WalletState,
  telegramId: number
): Promise<WalletState | null> {
  return await moveToNextState<WalletState>(
    currentState,
    exchangeFlow,
    telegramId
  )
}
