import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import logger from 'modules/Logger'

export const ACCOUNT_STATE_LABEL = 'account'

export enum AccountStateKey {
  start = 'start',
  account = 'account',
  cb_paymentMethods = 'cb_paymentMethods',
  cb_referralLink = 'cb_referralLink'
}

export const STATE_EXPIRY = 86400

export interface IAccountState {
  [AccountStateKey.cb_paymentMethods]?: {} & CallbackDefaults
  [AccountStateKey.cb_referralLink]?: {} & CallbackDefaults
}

export interface AccountState extends State<AccountStateKey>, IAccountState {}

export function getNextStateKey(
  currentState: AccountState | null
): AccountStateKey | null {
  if (!currentState) {
    return null
  }

  const stateKey = currentState.currentStateKey

  switch (stateKey) {
    case AccountStateKey.start:
      return AccountStateKey.account
    case AccountStateKey.account:
      return null
  }

  logger.error(`Unhandled case: AccountState.getNextStateKey ${stateKey}`)
  return null
}

export const initialState: AccountState = Object.freeze({
  currentStateKey: AccountStateKey.start,
  previousStateKey: null,
  key: ACCOUNT_STATE_LABEL
})

export async function nextAccountState(
  currentState: AccountState | null,
  telegramId: number
): Promise<AccountState | null> {
  const nextStateKey = getNextStateKey(currentState)

  return await moveToNextState<AccountStateKey>(
    currentState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
