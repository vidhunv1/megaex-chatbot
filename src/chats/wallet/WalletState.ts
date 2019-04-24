import { State } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import * as _ from 'lodash'
import { DepositStateKey, DepositState } from './deposit'
import { SendCoinStateKey, SendCoinState } from './sendCoin'
import { WithdrawStateKey, WithdrawState } from './withdraw'
import { WalletHomeStateKey, WalletHomeState } from './home/types'

export const WALLET_STATE_LABEL = 'wallet'
export const STATE_EXPIRY = 86400

export const initialState: WalletState = Object.freeze({
  currentStateKey: WalletHomeStateKey.start,
  previousStateKey: null,
  key: WALLET_STATE_LABEL
})

export type WalletStateKey =
  | WalletHomeStateKey
  | DepositStateKey
  | SendCoinStateKey
  | WithdrawStateKey

export interface WalletState
  extends State<WalletStateKey>,
    WalletHomeState,
    DepositState,
    SendCoinState,
    WithdrawState {}

export async function updateNextWalletState(
  updatedState: WalletState | null,
  nextStateKey: WalletStateKey | null,
  telegramId: number
): Promise<WalletState | null> {
  return await moveToNextState<WalletStateKey>(
    updatedState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
