import { WithdrawStateKey, WithdrawCoinError } from './types'
import { Parser } from 'chats/types'
import {
  WalletState,
  WalletStateKey,
  updateNextWalletState
} from '../WalletState'
import logger from 'modules/Logger'
import * as _ from 'lodash'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { Namespace } from 'modules/i18n'

export const WithdrawParser: Parser<WalletState> = async (
  msg,
  user,
  tUser,
  currentState
) => {
  const parser: Record<WithdrawStateKey, () => Promise<WalletState | null>> = {
    [WithdrawStateKey.withdrawCoin_address]: async () => {
      const withdrawState = currentState[WithdrawStateKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        if (isValidAddress(msg.text, withdrawState.currencyCode)) {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_address]: {
              data: {
                address: msg.text
              },
              error: null
            }
          }
        } else {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_address]: {
              data: null,
              error: WithdrawCoinError.INVALID_ADDRESS
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WithdrawStateKey.withdrawCoin_address}`
      )
      return null
    },

    [WithdrawStateKey.withdrawCoin_amount]: async () => {
      const withdrawState = currentState[WithdrawStateKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        const cryptocurrencyCode = withdrawState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INVALID_AMOUNT
            }
          }
        }

        const { currencyKind, amount } = parsedCurrency

        let cryptocurrencyValue, fiatValue
        if (currencyKind === 'crypto') {
          cryptocurrencyValue = amount
          fiatValue = getFiatValue(amount, cryptocurrencyCode, fiatcurrencyCode)
        } else {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INVALID_AMOUNT
            }
          }
        }

        if (cryptocurrencyValue <= getWalletBalance(cryptocurrencyCode)) {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_amount]: {
              data: {
                cryptoCurrencyAmount: cryptocurrencyValue,
                cryptoCurrency: cryptocurrencyCode,
                fiatValue,
                fiatCurrency: fiatcurrencyCode
              },
              error: null
            }
          }
        } else {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INSUFFICIENT_BALANCE
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WithdrawStateKey.withdrawCoin_amount}`
      )
      return null
    },

    [WithdrawStateKey.withdrawCoin_confirm]: async () => {
      const withdrawAmountState =
        currentState[WithdrawStateKey.withdrawCoin_amount]
      const withdrawAddressState =
        currentState[WithdrawStateKey.withdrawCoin_address]
      if (
        withdrawAddressState &&
        withdrawAddressState.data &&
        withdrawAmountState &&
        withdrawAmountState.data &&
        msg.text &&
        msg.text === user.t(`${Namespace.Wallet}:withdraw.confirm-button`)
      ) {
        const {
          cryptoCurrencyAmount,
          cryptoCurrency
        } = withdrawAmountState.data
        const { address } = withdrawAddressState.data
        if (processWithdrawal(cryptoCurrencyAmount, address, cryptoCurrency)) {
          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_confirm]: {
              error: null
            }
          }
        } else {
          logger.error(`Withdraw processing error: walletParser#withdrawConfirm 
            
            ${JSON.stringify(currentState)}
            `)

          return {
            ...currentState,
            [WithdrawStateKey.withdrawCoin_confirm]: {
              error: WithdrawCoinError.CREATE_ERROR
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WithdrawStateKey.withdrawCoin_confirm}`
      )
      return null
    },

    [WithdrawStateKey.cb_withdrawCoin]: async () => {
      const cbState = _.get(
        currentState,
        WithdrawStateKey.cb_withdrawCoin,
        null
      )
      if (!cbState) {
        return null
      }
      const cryptoCurrencyCode = cbState.currencyCode
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WithdrawStateKey.cb_withdrawCoin]: {
          ...cbState,
          data: {
            cryptoBalance,
            fiatValue: getFiatValue(
              cryptoBalance,
              cryptoCurrencyCode,
              fiatCurrencyCode
            ),
            fiatCurrencyCode
          }
        }
      }
    },

    [WithdrawStateKey.withdrawCoin_error]: async () => {
      return null
    },

    [WithdrawStateKey.withdrawCoin_show]: async () => {
      return null
    }
  }

  // update state
  const updatedState = await parser[
    currentState.currentStateKey as WithdrawStateKey
  ]()
  const nextStateKey = nextWithdrawState(updatedState)
  const nextState = updateNextWalletState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextWithdrawState(
  state: WalletState | null
): WalletStateKey | null {
  if (state === null) {
    return null
  }
  switch (state.currentStateKey) {
    case WithdrawStateKey.cb_withdrawCoin:
      return WithdrawStateKey.withdrawCoin_amount
    case WithdrawStateKey.withdrawCoin_amount: {
      const amountState = state[WithdrawStateKey.withdrawCoin_amount]
      if (!amountState) {
        return null
      }

      if (amountState.error) {
        if (amountState.error === WithdrawCoinError.INVALID_AMOUNT) {
          return WithdrawStateKey.withdrawCoin_amount
        }
        return WithdrawStateKey.withdrawCoin_error
      } else {
        return WithdrawStateKey.withdrawCoin_address
      }
    }
    case WithdrawStateKey.withdrawCoin_address:
      const addressState = state[WithdrawStateKey.withdrawCoin_address]
      if (!addressState) {
        return null
      }

      if (addressState.error) {
        return WithdrawStateKey.withdrawCoin_error
      } else {
        return WithdrawStateKey.withdrawCoin_confirm
      }
    case WithdrawStateKey.withdrawCoin_confirm:
      const confirmStateError = _.get(
        state[WithdrawStateKey.withdrawCoin_confirm],
        'error',
        null
      )
      if (confirmStateError) {
        return WithdrawStateKey.withdrawCoin_error
      } else {
        return WithdrawStateKey.withdrawCoin_show
      }
    case WithdrawStateKey.withdrawCoin_show:
      return null
    case WithdrawStateKey.withdrawCoin_error:
      return null
    default:
      return null
  }
}

const isValidAddress = (_address: string, _currencyCode: CryptoCurrency) => {
  return true
}

const getFiatValue = (
  amount: number,
  _fromCurrency: CryptoCurrency,
  _toCurrency: FiatCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount * 300000
}

const getWalletBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.2
}

const processWithdrawal = (
  _amount: number,
  _address: string,
  _currencyCode: CryptoCurrency
) => {
  return true
}