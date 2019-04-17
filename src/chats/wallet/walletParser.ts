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

// TODO: Implement these functions
const getCryptoValue = (
  amount: number,
  _fromCurrency: FiatCurrency,
  _toCurrency: CryptoCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount / 300000
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

export function walletParser(
  msg: TelegramBot.Message,
  user: User,
  currentState: WalletState
): WalletState | null {
  switch (currentState.currentStateKey) {
    case WalletStateKey.start:
      return currentState
    // SendCoin
    case WalletStateKey.sendCoin_amount: {
      const sendCoinState = currentState[WalletStateKey.sendCoin]
      if (msg.text && sendCoinState) {
        const cryptocurrencyCode = sendCoinState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return currentState
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
      const sendCoinState = currentState[WalletStateKey.sendCoin]
      if (
        msg.text &&
        sendCoinState &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency-button`)
      ) {
        return currentState
      }

      logger.error(
        `unhandled at WalletParser ${WalletStateKey.sendCoin_confirm}`
      )
      return null
    }

    // DepositCoin
    case WalletStateKey.depositCoin: {
      const depositCoinState = currentState[WalletStateKey.depositCoin]
      if (!depositCoinState) {
        logger.error(`unhandled at WalletParser ${WalletStateKey.depositCoin}`)
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
      const withdrawState = currentState[WalletStateKey.withdrawCoin]
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
      const withdrawState = currentState[WalletStateKey.withdrawCoin]
      if (msg.text && withdrawState) {
        const cryptocurrencyCode = withdrawState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return currentState
        }

        const { currencyKind, amount } = parsedCurrency

        let cryptocurrencyValue, fiatValue
        if (currencyKind === 'crypto') {
          cryptocurrencyValue = amount
          fiatValue = getFiatValue(amount, cryptocurrencyCode, fiatcurrencyCode)
        } else {
          return currentState
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
    case WalletStateKey.sendCoin:
    case WalletStateKey.withdrawCoin:
    case WalletStateKey.depositCoin:
      return currentState

    // Should never come here...
    default:
      logger.error(`unhandled at WalletParser 'default'`)
      return null
  }
}
