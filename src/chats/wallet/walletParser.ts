import {
  WalletState,
  WalletStateKey,
  SendCoinError,
  WithdrawCoinError
} from './WalletState'
import { parseCurrencyAmount } from './utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import logger from 'modules/Logger'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import * as _ from 'lodash'

// TODO: Implement these functions
const getCryptoValue = (
  amount: number,
  _fromCurrency: FiatCurrency,
  _toCurrency: CryptoCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount / 300000
}

const getWalletAddress = (_cryptoCurrency: CryptoCurrency) => {
  return '1b4e8hq51051b4e8hq51051b4e8hq51051b4e8hq5105'
}

const processWithdrawal = (
  _amount: number,
  _address: string,
  _currencyCode: CryptoCurrency
) => {
  return true
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

const getBlockedBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.01
}

const getEarnings = () => {
  logger.error('TODO: Not implemented getEarnings WalletChat#25')
  return 0.1
}

const getReferralCount = () => {
  logger.error('TODO: Not implemented getReferralCount WalletChat#25')
  return 100
}

const getPaymentLink = () => {
  logger.error('TODO: Not implemented getPaymentLink WalletChat#25')
  return 'https://t.me/megadealsbot?start=saddawq213123'
}

const getExpiryTime = () => {
  return 6 * 60 * 60
}

const CURRENT_CURRENCY_CODE = CryptoCurrency.BTC

export function walletParser(
  msg: TelegramBot.Message,
  user: User,
  currentState: WalletState
): WalletState | null {
  switch (currentState.currentStateKey) {
    case WalletStateKey.start: {
      const cryptoCurrencyCode = CURRENT_CURRENCY_CODE
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletStateKey.start]: {
          data: {
            cryptoCurrencyCode,
            cryptoBalance,
            fiatValue: getFiatValue(
              cryptoBalance,
              cryptoCurrencyCode,
              fiatCurrencyCode
            ),
            fiatCurrencyCode,
            blockedBalance: getBlockedBalance(cryptoCurrencyCode),
            earnings: getEarnings(),
            referralCount: getReferralCount()
          }
        }
      }
    }
    // SendCoin
    case WalletStateKey.sendCoin_amount: {
      const sendCoinState = currentState[WalletStateKey.cb_sendCoin]
      if (msg.text && sendCoinState) {
        const cryptocurrencyCode = sendCoinState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return {
            ...currentState,
            [WalletStateKey.sendCoin_amount]: {
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

        if (cryptocurrencyValue <= getWalletBalance(cryptocurrencyCode)) {
          return {
            ...currentState,
            [WalletStateKey.sendCoin_amount]: {
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
            [WalletStateKey.sendCoin_amount]: {
              data: null,
              error: SendCoinError.INSUFFICIENT_BALANCE
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.sendCoin_amount}`
      )
      return null
    }
    case WalletStateKey.sendCoin_confirm: {
      const sendCoinState = currentState[WalletStateKey.cb_sendCoin]
      if (
        msg.text &&
        sendCoinState &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency-button`)
      ) {
        return {
          ...currentState,
          [WalletStateKey.sendCoin_confirm]: {
            data: {
              paymentLink: getPaymentLink(),
              expiryTimeS: getExpiryTime()
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.sendCoin_confirm}`
      )
      return null
    }

    // DepositCoin
    case WalletStateKey.cb_depositCoin: {
      const depositCoinState = currentState[WalletStateKey.cb_depositCoin]
      if (!depositCoinState) {
        logger.error(
          `unhandled at WalletParser ${WalletStateKey.cb_depositCoin}`
        )
        return null
      }

      const currencyCode = depositCoinState.currencyCode
      return {
        ...currentState,
        [WalletStateKey.depositCoin_show]: {
          address: getWalletAddress(currencyCode),
          currencyCode
        }
      }
    }

    // WithdrawCoin
    case WalletStateKey.withdrawCoin_address: {
      const withdrawState = currentState[WalletStateKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        if (isValidAddress(msg.text, withdrawState.currencyCode)) {
          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_address]: {
              data: {
                address: msg.text
              },
              error: null
            }
          }
        } else {
          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_address]: {
              data: null,
              error: WithdrawCoinError.INVALID_ADDRESS
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.withdrawCoin_address}`
      )
      return null
    }

    case WalletStateKey.withdrawCoin_amount: {
      const withdrawState = currentState[WalletStateKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        const cryptocurrencyCode = withdrawState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_amount]: {
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
            [WalletStateKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INVALID_AMOUNT
            }
          }
        }

        if (cryptocurrencyValue <= getWalletBalance(cryptocurrencyCode)) {
          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_amount]: {
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
            [WalletStateKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INSUFFICIENT_BALANCE
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.withdrawCoin_amount}`
      )
      return null
    }

    case WalletStateKey.withdrawCoin_confirm: {
      const withdrawAmountState =
        currentState[WalletStateKey.withdrawCoin_amount]
      const withdrawAddressState =
        currentState[WalletStateKey.withdrawCoin_address]
      if (
        withdrawAddressState &&
        withdrawAddressState.data &&
        withdrawAmountState &&
        withdrawAmountState.data &&
        msg.text &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-withdraw-cryptocurrency-button`)
      ) {
        const {
          cryptoCurrencyAmount,
          cryptoCurrency
        } = withdrawAmountState.data
        const { address } = withdrawAddressState.data
        if (processWithdrawal(cryptoCurrencyAmount, address, cryptoCurrency)) {
          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_confirm]: {
              error: null
            }
          }
        } else {
          logger.error(`Withdraw processing error: walletParser#withdrawConfirm 
          
          ${JSON.stringify(currentState)}
          `)

          return {
            ...currentState,
            [WalletStateKey.withdrawCoin_confirm]: {
              error: WithdrawCoinError.CREATE_ERROR
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.withdrawCoin_confirm}`
      )
      return null
    }

    // Callbacks
    case WalletStateKey.cb_sendCoin:
      const cbState = _.get(currentState, WalletStateKey.cb_sendCoin, null)
      if (!cbState) {
        return null
      }
      const cryptoCurrencyCode = cbState.currencyCode
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletStateKey.cb_sendCoin]: {
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
    case WalletStateKey.cb_withdrawCoin: {
      const cbState = _.get(currentState, WalletStateKey.cb_withdrawCoin, null)
      if (!cbState) {
        return null
      }
      const cryptoCurrencyCode = cbState.currencyCode
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletStateKey.cb_withdrawCoin]: {
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
    }
    case WalletStateKey.cb_depositCoin:
      return currentState

    // Should never come here...
    default:
      logger.error(
        `unhandled at WalletParser 'default' ${JSON.stringify(currentState)}`
      )
      return null
  }
}
