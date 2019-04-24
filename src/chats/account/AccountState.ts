import { State } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import * as _ from 'lodash'
import { ReferralStateKey, ReferralState } from './referral'
import { SettingsState, SettingsStateKey } from './settings'
import { PaymentMethodState, PaymentMethodStateKey } from './paymentMethods'
import { AccountHomeStateKey, AccountHomeState } from './home'

export const ACCOUNT_STATE_LABEL = 'account'

export type AccountStateKey =
  | AccountHomeStateKey
  | ReferralStateKey
  | SettingsStateKey
  | PaymentMethodStateKey

export const STATE_EXPIRY = 86400

export interface AccountState
  extends State<AccountStateKey>,
    AccountHomeState,
    ReferralState,
    SettingsState,
    PaymentMethodState {}

export const initialState: AccountState = Object.freeze({
  currentStateKey: AccountHomeStateKey.start,
  previousStateKey: null,
  key: ACCOUNT_STATE_LABEL
})

export async function updateNextAccountState(
  currentState: AccountState | null,
  nextStateKey: AccountStateKey | null,
  telegramId: number
): Promise<AccountState | null> {
  return await moveToNextState<AccountStateKey>(
    currentState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
