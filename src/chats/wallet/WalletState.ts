import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import * as _ from 'lodash'

export const WALLET_STATE_LABEL = 'wallet'

export enum WalletStateKey {
  start = 'start',
  wallet = 'wallet',

  sendCoin = 'sendCoin',
  sendCoin_amount = 'sendCoin_amount',
  sendCoin_confirm = 'sendCoin_confirm',
  sendCoin_show = 'sendCoin_show',
  sendCoin_error = 'sendCoin_error',

  withdrawCoin = 'withdrawCoin',
  withdrawCoin_amount = 'withdrawCoin_amount',
  withdrawCoin_address = 'withdrawCoin_address',
  withdrawCoin_confirm = 'withdrawCoin_confirm',
  withdrawCoin_show = 'withdrawCoin_show',
  withdrawCoin_error = 'withdrawCoin_error',

  depositCoin = 'depositCoin',
  depositCoin_show = 'depositCoin_show'
}

export enum SendCoinError {
  INSUFFICIENT_BALANCE = 'insufficientBalance',
  INVALID_AMOUNT = 'invalidAmount'
}

export enum WithdrawCoinError {
  INVALID_ADDRESS = 'invalidAddress',
  CREATE_ERROR = 'createError',
  INSUFFICIENT_BALANCE = 'insufficientBalance'
}

export interface IWalletState {
  // Send coin
  [WalletStateKey.sendCoin]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [WalletStateKey.sendCoin_amount]?: {
    data: {
      cryptoCurrencyAmount: number
      cryptoCurrency: CryptoCurrency
      fiatValue: number
      fiatCurrency: FiatCurrency
    } | null
    error:
      | SendCoinError.INSUFFICIENT_BALANCE
      | SendCoinError.INVALID_AMOUNT
      | null
  }

  // Deposit
  [WalletStateKey.depositCoin]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [WalletStateKey.depositCoin_show]?: {
    currencyCode: CryptoCurrency
    address: string
  }

  // withdraw
  [WalletStateKey.withdrawCoin]?: {
    currencyCode: CryptoCurrency
  } & CallbackDefaults
  [WalletStateKey.withdrawCoin_amount]?: {
    data: {
      cryptoCurrencyAmount: number
      cryptoCurrency: CryptoCurrency
      fiatValue: number
      fiatCurrency: FiatCurrency
    } | null
    error: WithdrawCoinError.INSUFFICIENT_BALANCE | null
  }
  [WalletStateKey.withdrawCoin_address]?: {
    data: {
      address: string
    } | null
    error: WithdrawCoinError.INVALID_ADDRESS | null
  }
  [WalletStateKey.withdrawCoin_confirm]?: {
    error: WithdrawCoinError.CREATE_ERROR | null
  }
}

export interface WalletState extends State<WalletStateKey>, IWalletState {}

export const initialState: WalletState = {
  currentStateKey: WalletStateKey.start,
  previousStateKey: null,
  key: WALLET_STATE_LABEL
}

export function getNextStateKey(
  currentState: WalletState | null
): WalletStateKey | null {
  if (!currentState) {
    return null
  }

  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case WalletStateKey.start:
      return WalletStateKey.wallet
    case WalletStateKey.wallet:
      return null

    case WalletStateKey.sendCoin:
      return WalletStateKey.sendCoin_amount
    case WalletStateKey.sendCoin_amount: {
      const amountState = currentState[WalletStateKey.sendCoin_amount]
      if (!amountState) {
        return null
      }

      const { error } = amountState
      if (error) {
        if (error === SendCoinError.INVALID_AMOUNT) {
          return WalletStateKey.sendCoin_amount
        }
        return WalletStateKey.sendCoin_error
      } else {
        return WalletStateKey.sendCoin_confirm
      }
    }
    case WalletStateKey.sendCoin_confirm:
      return WalletStateKey.sendCoin_show
    case WalletStateKey.sendCoin_show:
      return null
    case WalletStateKey.sendCoin_error: {
      return null
    }

    case WalletStateKey.withdrawCoin:
      return WalletStateKey.withdrawCoin_amount
    case WalletStateKey.withdrawCoin_amount: {
      const amountState = currentState[WalletStateKey.withdrawCoin_amount]
      if (!amountState) {
        return null
      }

      if (amountState.error) {
        return WalletStateKey.withdrawCoin_error
      } else {
        return WalletStateKey.withdrawCoin_address
      }
    }
    case WalletStateKey.withdrawCoin_address:
      const addressState = currentState[WalletStateKey.withdrawCoin_address]
      if (!addressState) {
        return null
      }

      if (addressState.error) {
        return WalletStateKey.withdrawCoin_error
      } else {
        return WalletStateKey.withdrawCoin_confirm
      }
    case WalletStateKey.withdrawCoin_confirm:
      const confirmStateError = _.get(
        currentState[WalletStateKey.withdrawCoin_confirm],
        'error',
        null
      )
      if (confirmStateError) {
        return WalletStateKey.withdrawCoin_error
      } else {
        return WalletStateKey.withdrawCoin_show
      }
    case WalletStateKey.withdrawCoin_show:
      return null
    case WalletStateKey.withdrawCoin_error:
      return null

    case WalletStateKey.depositCoin:
      return WalletStateKey.depositCoin_show
    case WalletStateKey.depositCoin_show:
      return null
  }
}

export async function nextWalletState(
  currentState: WalletState | null,
  telegramId: number
): Promise<WalletState | null> {
  const nextStateKey = getNextStateKey(currentState)
  return await moveToNextState<WalletStateKey>(
    currentState,
    telegramId,
    nextStateKey
  )
}
