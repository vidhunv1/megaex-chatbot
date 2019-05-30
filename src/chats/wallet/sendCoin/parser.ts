import { logger } from 'modules'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { SendCoinStateKey, SendCoinError } from './types'
import { Parser } from 'chats/types'
import {
  WalletStateKey,
  WalletState,
  updateNextWalletState
} from '../WalletState'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { Namespace } from 'modules/i18n'
import * as _ from 'lodash'
import { CONFIG } from '../../../config'
import { Transaction } from 'models'
import Transfer from 'models/Transfer'
import { linkCreator } from 'utils/linkCreator'

export const SendCoinParser: Parser<WalletState> = async (
  msg,
  user,
  tUser,
  currentState
) => {
  const parser: Record<SendCoinStateKey, () => Promise<WalletState | null>> = {
    [SendCoinStateKey.cb_sendCoin]: async () => {
      const cbState = _.get(currentState, SendCoinStateKey.cb_sendCoin, null)
      if (!cbState) {
        return null
      }
      const cryptoCurrencyCode = cbState.currencyCode
      const cryptoBalance = await getWalletBalance(user.id, cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [SendCoinStateKey.cb_sendCoin]: {
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

    [SendCoinStateKey.sendCoin_amount]: async () => {
      const sendCoinState = currentState[SendCoinStateKey.cb_sendCoin]
      if (msg.text && sendCoinState) {
        const cryptocurrencyCode = sendCoinState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return {
            ...currentState,
            [SendCoinStateKey.sendCoin_amount]: {
              data: null,
              error: SendCoinError.INVALID_AMOUNT
            }
          }
        }

        const { currencyCode, currencyKind, amount } = parsedCurrency

        let cryptocurrencyValue, fiatValue
        if (currencyKind === 'fiat') {
          cryptocurrencyValue = getCryptoValue(
            amount,
            currencyCode as FiatCurrency,
            cryptocurrencyCode
          )
          fiatValue = amount
        } else if (currencyKind === 'crypto') {
          cryptocurrencyValue = amount
          fiatValue = getFiatValue(amount, cryptocurrencyCode, fiatcurrencyCode)
        } else {
          return null
        }

        if (
          cryptocurrencyValue <=
          (await getWalletBalance(user.id, cryptocurrencyCode))
        ) {
          return {
            ...currentState,
            [SendCoinStateKey.sendCoin_amount]: {
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
            [SendCoinStateKey.sendCoin_amount]: {
              data: null,
              error: SendCoinError.INSUFFICIENT_BALANCE
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${SendCoinStateKey.sendCoin_amount}`
      )
      return null
    },

    [SendCoinStateKey.sendCoin_confirm]: async () => {
      const sendCoinState = currentState[SendCoinStateKey.cb_sendCoin]
      if (
        msg.text &&
        sendCoinState &&
        msg.text === user.t(`${Namespace.Wallet}:send-coin.confirm-button`)
      ) {
        const data = _.get(currentState, 'sendCoin_amount.data', null)
        const cryptoAmount = _.get(data, 'cryptoCurrencyAmount', null)
        const cryptocurrencyCode = _.get(data, 'cryptoCurrency', null)
        if (!cryptoAmount || !cryptocurrencyCode) {
          return {
            ...currentState,
            [SendCoinStateKey.sendCoin_confirm]: {
              error: SendCoinError.CREATE_PAYMENT_ERROR,
              data: null
            }
          }
        }

        const pmlink = await createPayment(
          user.id,
          cryptoAmount,
          cryptocurrencyCode
        )
        if (!pmlink) {
          return {
            ...currentState,
            [SendCoinStateKey.sendCoin_confirm]: {
              error: SendCoinError.CREATE_PAYMENT_ERROR,
              data: null
            }
          }
        }

        return {
          ...currentState,
          [SendCoinStateKey.sendCoin_confirm]: {
            data: {
              paymentLink: linkCreator.getPaymentLink(pmlink),
              expiryTimeS: getExpiryTime()
            },
            error: null
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${SendCoinStateKey.sendCoin_confirm}`
      )
      return null
    },

    [SendCoinStateKey.sendCoin_show]: async () => {
      return null
    },

    [SendCoinStateKey.sendCoin_error]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as SendCoinStateKey
  ]()
  const nextStateKey = nextSendCoinState(updatedState)
  const nextState = updateNextWalletState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextSendCoinState(
  state: WalletState | null
): WalletStateKey | null {
  if (state === null) {
    return null
  }
  switch (state.currentStateKey) {
    case SendCoinStateKey.cb_sendCoin:
      return SendCoinStateKey.sendCoin_amount
    case SendCoinStateKey.sendCoin_amount: {
      const amountState = state[SendCoinStateKey.sendCoin_amount]
      if (!amountState) {
        return null
      }

      const { error } = amountState
      if (error) {
        if (error === SendCoinError.INVALID_AMOUNT) {
          return SendCoinStateKey.sendCoin_amount
        }
        return SendCoinStateKey.sendCoin_error
      } else {
        return SendCoinStateKey.sendCoin_confirm
      }
    }
    case SendCoinStateKey.sendCoin_confirm:
      const confirmState = state[SendCoinStateKey.sendCoin_confirm]
      if (!confirmState) {
        return null
      }
      const { error } = confirmState
      if (error) {
        return SendCoinStateKey.sendCoin_error
      }

      return SendCoinStateKey.sendCoin_show
    case SendCoinStateKey.sendCoin_show:
      return null
    case SendCoinStateKey.sendCoin_error: {
      return null
    }
    default:
      return null
  }
}

// Getters
const getCryptoValue = (
  amount: number,
  _fromCurrency: FiatCurrency,
  _toCurrency: CryptoCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount / 300000
}

const createPayment = async (
  userId: number,
  amount: number,
  cryptocurrency: CryptoCurrency
): Promise<string | null> => {
  try {
    return await Transfer.newPayment(userId, cryptocurrency, amount)
  } catch (e) {
    return null
  }
}

const getExpiryTime = () => {
  return parseInt(CONFIG.PAYMENT_EXPIRY_S)
}

const getFiatValue = (
  amount: number,
  _fromCurrency: CryptoCurrency,
  _toCurrency: FiatCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount * 300000
}

const getWalletBalance = async (
  userId: number,
  cryptoCurrency: CryptoCurrency
) => {
  return await Transaction.getAvailableBalance(userId, cryptoCurrency)
}
