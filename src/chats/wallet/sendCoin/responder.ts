import { SendCoinStateKey, SendCoinError } from './types'
import { Responder } from 'chats/types'
import { WalletState } from '../WalletState'
import * as _ from 'lodash'
import { logger } from 'modules'
import { SendCoinMessage } from './messages'

export const SendCoinResponder: Responder<WalletState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<SendCoinStateKey, () => Promise<boolean>> = {
    [SendCoinStateKey.sendCoin_amount]: async () => {
      const sendCoinState = _.get(
        currentState[SendCoinStateKey.cb_sendCoin],
        'data',
        null
      )
      const cryptoCurrencyCode = _.get(
        currentState[SendCoinStateKey.cb_sendCoin],
        'currencyCode',
        null
      )
      if (!sendCoinState || !cryptoCurrencyCode) {
        return false
      }

      await SendCoinMessage(msg, user).askCryptocurrencyAmount(
        cryptoCurrencyCode,
        sendCoinState.cryptoBalance,
        user.currencyCode,
        sendCoinState.fiatValue
      )

      return true
    },

    [SendCoinStateKey.sendCoin_confirm]: async () => {
      const sendCoinAmountState = currentState[SendCoinStateKey.sendCoin_amount]
      if (!sendCoinAmountState || !sendCoinAmountState.data) {
        return false
      }

      const {
        cryptoCurrencyAmount,
        cryptoCurrency,
        fiatValue,
        fiatCurrency
      } = sendCoinAmountState.data
      await SendCoinMessage(msg, user).sendCoinConfirm(
        cryptoCurrency,
        cryptoCurrencyAmount,
        fiatCurrency,
        fiatValue
      )

      return true
    },

    [SendCoinStateKey.sendCoin_error]: async () => {
      const errorType: SendCoinError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )

      if (!errorType) {
        logger.error('Wallet responder#sendCoin unhandled error ' + errorType)
        return false
      }

      switch (errorType) {
        case SendCoinError.INSUFFICIENT_BALANCE: {
          const sendCoinState = currentState[SendCoinStateKey.cb_sendCoin]
          if (!sendCoinState || !sendCoinState.data) {
            return false
          }

          await SendCoinMessage(msg, user).errorInsufficientBalance(
            sendCoinState.currencyCode,
            sendCoinState.data.cryptoBalance
          )

          return true
        }

        case SendCoinError.INVALID_AMOUNT: {
          const sendCoinState = currentState[SendCoinStateKey.cb_sendCoin]
          if (!sendCoinState) {
            return false
          }

          await SendCoinMessage(msg, user).errorInvalidAmount()
          return true
        }

        default:
          logger.error(
            `walletResponder: ${SendCoinStateKey.sendCoin_error} -> 'default'`
          )
          return false
      }
    },

    [SendCoinStateKey.sendCoin_show]: async () => {
      const createdPayment = _.get(
        currentState[SendCoinStateKey.sendCoin_confirm],
        'data',
        null
      )
      if (!createdPayment) {
        return false
      }

      await SendCoinMessage(msg, user).showCreated(
        createdPayment.paymentLink,
        createdPayment.expiryTimeS
      )
      return true
    },

    [SendCoinStateKey.cb_sendCoin]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as SendCoinStateKey]()
}
