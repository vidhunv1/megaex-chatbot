import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import * as _ from 'lodash'
import { DepositStateKey, DepositState, nextDepositState } from './deposit'
import { nextSendCoinState, SendCoinStateKey, SendCoinState } from './sendCoin'

export const WALLET_STATE_LABEL = 'wallet'
export const STATE_EXPIRY = 86400

export enum WalletHomeKey {
  start = 'start',
  wallet = 'wallet',

  cb_withdrawCoin = 'cb_withdrawCoin',
  withdrawCoin_amount = 'withdrawCoin_amount',
  withdrawCoin_address = 'withdrawCoin_address',
  withdrawCoin_confirm = 'withdrawCoin_confirm',
  withdrawCoin_show = 'withdrawCoin_show',
  withdrawCoin_error = 'withdrawCoin_error'
}

export interface WalletHomeState {
  [WalletHomeKey.start]?: {
    data: {
      cryptoCurrencyCode: CryptoCurrency
      cryptoBalance: number
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
      blockedBalance: number
      earnings: number
      referralCount: number
    } | null
  }

  // withdraw
  [WalletHomeKey.cb_withdrawCoin]?: {
    currencyCode: CryptoCurrency
    data: {
      cryptoBalance: number
      fiatValue: number
      fiatCurrencyCode: FiatCurrency
    } | null
  } & CallbackDefaults
  [WalletHomeKey.withdrawCoin_amount]?: {
    data: {
      cryptoCurrencyAmount: number
      cryptoCurrency: CryptoCurrency
      fiatValue: number
      fiatCurrency: FiatCurrency
    } | null
    error:
      | WithdrawCoinError.INSUFFICIENT_BALANCE
      | WithdrawCoinError.INVALID_AMOUNT
      | null
  }
  [WalletHomeKey.withdrawCoin_address]?: {
    data: {
      address: string
    } | null
    error: WithdrawCoinError.INVALID_ADDRESS | null
  }
  [WalletHomeKey.withdrawCoin_confirm]?: {
    error: WithdrawCoinError.CREATE_ERROR | null
  }
}

export type WalletStateKey = WalletHomeKey | DepositStateKey | SendCoinStateKey

export enum WithdrawCoinError {
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  INVALID_AMOUNT = 'INVALID_AMOUNT',
  CREATE_ERROR = 'CREATE_ERROR',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE'
}

export interface IWalletState
  extends DepositState,
    SendCoinState,
    WalletHomeState {}

export interface WalletState extends State<WalletStateKey>, IWalletState {}

export const initialState: WalletState = Object.freeze({
  currentStateKey: WalletHomeKey.start,
  previousStateKey: null,
  key: WALLET_STATE_LABEL
})

export function getNextStateKey(
  currentState: WalletState | null
): WalletStateKey | null {
  if (!currentState) {
    return null
  }
  // Deposit
  if (Object.keys(DepositStateKey).includes(currentState.currentStateKey)) {
    return nextDepositState(currentState)
  }

  if (Object.keys(SendCoinStateKey).includes(currentState.currentStateKey)) {
    return nextSendCoinState(currentState)
  }

  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case WalletHomeKey.start:
      return WalletHomeKey.wallet
    case WalletHomeKey.wallet:
      return null

    case WalletHomeKey.cb_withdrawCoin:
      return WalletHomeKey.withdrawCoin_amount
    case WalletHomeKey.withdrawCoin_amount: {
      const amountState = currentState[WalletHomeKey.withdrawCoin_amount]
      if (!amountState) {
        return null
      }

      if (amountState.error) {
        if (amountState.error === WithdrawCoinError.INVALID_AMOUNT) {
          return WalletHomeKey.withdrawCoin_amount
        }
        return WalletHomeKey.withdrawCoin_error
      } else {
        return WalletHomeKey.withdrawCoin_address
      }
    }
    case WalletHomeKey.withdrawCoin_address:
      const addressState = currentState[WalletHomeKey.withdrawCoin_address]
      if (!addressState) {
        return null
      }

      if (addressState.error) {
        return WalletHomeKey.withdrawCoin_error
      } else {
        return WalletHomeKey.withdrawCoin_confirm
      }
    case WalletHomeKey.withdrawCoin_confirm:
      const confirmStateError = _.get(
        currentState[WalletHomeKey.withdrawCoin_confirm],
        'error',
        null
      )
      if (confirmStateError) {
        return WalletHomeKey.withdrawCoin_error
      } else {
        return WalletHomeKey.withdrawCoin_show
      }
    case WalletHomeKey.withdrawCoin_show:
      return null
    case WalletHomeKey.withdrawCoin_error:
      return null
  }

  return null
}

export async function nextWalletState(
  currentState: WalletState | null,
  telegramId: number
): Promise<WalletState | null> {
  const nextStateKey = getNextStateKey(currentState)
  return await moveToNextState<WalletStateKey>(
    currentState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
