import { WithdrawStateKey, WithdrawCoinError } from './types'
import { Responder } from 'chats/types'
import { WalletState } from '../WalletState'
import * as _ from 'lodash'
import { WithdrawMessage } from './messages'

export const WithdrawResponder: Responder<WalletState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<WithdrawStateKey, () => Promise<boolean>> = {
    [WithdrawStateKey.withdrawCoin_amount]: async () => {
      const withdrawCoinState = _.get(
        currentState[WithdrawStateKey.cb_withdrawCoin],
        'data',
        null
      )
      const cryptoCurrencyCode = _.get(
        currentState[WithdrawStateKey.cb_withdrawCoin],
        'currencyCode',
        null
      )
      if (!cryptoCurrencyCode || !withdrawCoinState) {
        return false
      }

      await WithdrawMessage(msg, user).enterWithdrawAmount(
        cryptoCurrencyCode,
        withdrawCoinState.cryptoBalance,
        withdrawCoinState.fiatValue
      )
      return true
    },

    [WithdrawStateKey.withdrawCoin_address]: async () => {
      const withdrawState = currentState[WithdrawStateKey.cb_withdrawCoin]
      if (!withdrawState) {
        return false
      }
      await WithdrawMessage(msg, user).enterWithdrawAddress(
        withdrawState.currencyCode
      )
      return true
    },

    [WithdrawStateKey.withdrawCoin_error]: async () => {
      const errorType: WithdrawCoinError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )
      if (!errorType) {
        return false
      }

      switch (errorType) {
        case WithdrawCoinError.INSUFFICIENT_BALANCE: {
          const withdrawCoinState = _.get(
            currentState[WithdrawStateKey.cb_withdrawCoin],
            'data',
            null
          )
          const cryptoCurrencyCode = _.get(
            currentState[WithdrawStateKey.cb_withdrawCoin],
            'currencyCode',
            null
          )
          if (!withdrawCoinState || !cryptoCurrencyCode) {
            return false
          }

          await WithdrawMessage(msg, user).errorInsufficientBalance(
            cryptoCurrencyCode,
            withdrawCoinState.cryptoBalance
          )
          return true
        }

        case WithdrawCoinError.INVALID_ADDRESS: {
          const withdrawState = currentState[WithdrawStateKey.cb_withdrawCoin]
          if (!withdrawState) {
            return false
          }

          await WithdrawMessage(msg, user).errorInvalidAddress(
            withdrawState.currencyCode
          )
          return true
        }

        case WithdrawCoinError.CREATE_ERROR: {
          await WithdrawMessage(msg, user).errorCreateWithdraw()
          return true
        }
      }

      return false
    },

    [WithdrawStateKey.withdrawCoin_confirm]: async () => {
      const amountState = _.get(
        currentState[WithdrawStateKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WithdrawStateKey.withdrawCoin_address],
        'data',
        null
      )
      if (!amountState || !addressState) {
        return false
      }

      const {
        cryptoCurrency,
        cryptoCurrencyAmount,
        fiatCurrency,
        fiatValue
      } = amountState
      await WithdrawMessage(msg, user).confirmWithdraw(
        cryptoCurrency,
        cryptoCurrencyAmount,
        fiatCurrency,
        fiatValue,
        addressState.address
      )
      return true
    },

    [WithdrawStateKey.withdrawCoin_show]: async () => {
      const amountState = _.get(
        currentState[WithdrawStateKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WithdrawStateKey.withdrawCoin_address],
        'data',
        null
      )
      if (!amountState || !addressState) {
        return false
      }

      await WithdrawMessage(msg, user).showCreatedWithdrawalSuccess()
      return true
    },

    [WithdrawStateKey.cb_withdrawCoin]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as WithdrawStateKey]()
}
