import { State, StateFlow } from 'chats/types'
import { moveToNextState } from 'chats/utils'

export const ACCOUNT_STATE_KEY = 'account'

export interface IAccountState {
  start?: boolean
  account?: boolean
}

export interface AccountState extends State<IAccountState>, IAccountState {}

export const exchangeFlow: StateFlow<IAccountState> = {
  start: 'account',
  account: null
}

export const initialState: AccountState = {
  currentMessageKey: 'start',
  key: ACCOUNT_STATE_KEY
}

export async function nextAccountState(
  currentState: AccountState,
  telegramId: number
): Promise<AccountState | null> {
  return await moveToNextState<AccountState>(
    currentState,
    exchangeFlow,
    telegramId
  )
}
