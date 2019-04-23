import { WalletState, WithdrawCoinError, WalletHomeKey } from './WalletState'
import { parseCurrencyAmount } from './utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import logger from 'modules/Logger'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import * as _ from 'lodash'
import { DepositParser } from './deposit/parser'
import { DepositStateKey } from './deposit'
import { SendCoinStateKey } from './sendCoin'
import { SendCoinParser } from './sendCoin'

// TODO: Implement these functions

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

const CURRENT_CURRENCY_CODE = CryptoCurrency.BTC

export async function walletParser(
  msg: TelegramBot.Message,
  user: User,
  currentState: WalletState
): Promise<WalletState | null> {
  // Deposit
  if (Object.keys(DepositStateKey).includes(currentState.currentStateKey)) {
    return await DepositParser(msg, user, currentState)[
      currentState.currentStateKey
    ]()
  }

  if (Object.keys(SendCoinStateKey).includes(currentState.currentStateKey)) {
    return await SendCoinParser(msg, user, currentState)[
      currentState.currentStateKey
    ]()
  }

  switch (currentState.currentStateKey) {
    case WalletHomeKey.start: {
      const cryptoCurrencyCode = CURRENT_CURRENCY_CODE
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletHomeKey.start]: {
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

    // DepositCoin

    // WithdrawCoin
    case WalletHomeKey.withdrawCoin_address: {
      const withdrawState = currentState[WalletHomeKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        if (isValidAddress(msg.text, withdrawState.currencyCode)) {
          return {
            ...currentState,
            [WalletHomeKey.withdrawCoin_address]: {
              data: {
                address: msg.text
              },
              error: null
            }
          }
        } else {
          return {
            ...currentState,
            [WalletHomeKey.withdrawCoin_address]: {
              data: null,
              error: WithdrawCoinError.INVALID_ADDRESS
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletHomeKey.withdrawCoin_address}`
      )
      return null
    }

    case WalletHomeKey.withdrawCoin_amount: {
      const withdrawState = currentState[WalletHomeKey.cb_withdrawCoin]
      if (msg.text && withdrawState) {
        const cryptocurrencyCode = withdrawState.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, cryptocurrencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return {
            ...currentState,
            [WalletHomeKey.withdrawCoin_amount]: {
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
            [WalletHomeKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INVALID_AMOUNT
            }
          }
        }

        if (cryptocurrencyValue <= getWalletBalance(cryptocurrencyCode)) {
          return {
            ...currentState,
            [WalletHomeKey.withdrawCoin_amount]: {
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
            [WalletHomeKey.withdrawCoin_amount]: {
              data: null,
              error: WithdrawCoinError.INSUFFICIENT_BALANCE
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletHomeKey.withdrawCoin_amount}`
      )
      return null
    }

    case WalletHomeKey.withdrawCoin_confirm: {
      const withdrawAmountState =
        currentState[WalletHomeKey.withdrawCoin_amount]
      const withdrawAddressState =
        currentState[WalletHomeKey.withdrawCoin_address]
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
            [WalletHomeKey.withdrawCoin_confirm]: {
              error: null
            }
          }
        } else {
          logger.error(`Withdraw processing error: walletParser#withdrawConfirm 
          
          ${JSON.stringify(currentState)}
          `)

          return {
            ...currentState,
            [WalletHomeKey.withdrawCoin_confirm]: {
              error: WithdrawCoinError.CREATE_ERROR
            }
          }
        }
      }

      logger.error(
        `unhandled at WalletParser ${WalletHomeKey.withdrawCoin_confirm}`
      )
      return null
    }

    // Callbacks

    case WalletHomeKey.cb_withdrawCoin: {
      const cbState = _.get(currentState, WalletHomeKey.cb_withdrawCoin, null)
      if (!cbState) {
        return null
      }
      const cryptoCurrencyCode = cbState.currencyCode
      const cryptoBalance = getWalletBalance(cryptoCurrencyCode)
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletHomeKey.cb_withdrawCoin]: {
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

    // Should never come here...
    default:
      logger.error(
        `unhandled at WalletParser 'default' ${JSON.stringify(currentState)}`
      )
      return null
  }
}
