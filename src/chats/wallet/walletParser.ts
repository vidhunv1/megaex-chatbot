import { WalletState, nextWalletState } from './WalletState'
import { parseCurrencyAmount } from './utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import logger from 'modules/Logger'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

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

export async function walletParser(
  msg: TelegramBot.Message,
  telegramId: number,
  user: User,
  currentState: WalletState
): Promise<WalletState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      return await nextWalletState(currentState, telegramId)
    case 'sendCoin':
      return await nextWalletState(currentState, telegramId)
    case 'withdraw':
      return await nextWalletState(currentState, telegramId)
    case 'sendCoinAmount':
      if (msg.text && currentState.sendCoin) {
        const cryptocurrencyCode = currentState.sendCoin.currencyCode
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
          currentState.sendCoinAmount = {
            cryptoCurrencyAmount: cryptocurrencyValue,
            cryptoCurrency: cryptocurrencyCode,
            fiatValue,
            fiatCurrency: fiatcurrencyCode
          }

          return await nextWalletState(
            currentState,
            telegramId,
            'paymentLinkConfirm'
          )
        } else {
          return await nextWalletState(
            currentState,
            telegramId,
            'insufficientSendAmount'
          )
        }
      } else {
        return null
      }
    case 'paymentLinkConfirm':
      if (
        msg.text &&
        currentState.sendCoin &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency-button`)
      ) {
        return await nextWalletState(currentState, telegramId)
      }
      return null
    case 'deposit':
      currentState.showDepositAddress = {
        currencyCode: CURRENT_CRYPTOCURRENCY,
        address: getWalletAddress(CURRENT_CRYPTOCURRENCY)
      }
      return await nextWalletState(currentState, telegramId)
    case 'withdrawCoinAmount':
      if (msg.text && currentState.withdraw) {
        const cryptocurrencyCode = currentState.withdraw.currencyCode
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
          currentState.withdrawCoinAmount = {
            cryptoCurrencyAmount: cryptocurrencyValue,
            cryptoCurrency: cryptocurrencyCode,
            fiatValue,
            fiatCurrency: fiatcurrencyCode
          }

          return await nextWalletState(
            currentState,
            telegramId,
            'withdrawAddress'
          )
        } else {
          return await nextWalletState(
            currentState,
            telegramId,
            'insufficientWithdrawAmount'
          )
        }
      } else {
        return null
      }
    case 'withdrawAddress':
      if (msg.text && currentState.withdraw) {
        if (isValidAddress(msg.text, currentState.withdraw.currencyCode)) {
          currentState.withdrawAddress = msg.text
          return await nextWalletState(
            currentState,
            telegramId,
            'withdrawConfirm'
          )
        } else {
          return await nextWalletState(
            currentState,
            telegramId,
            'invalidWithdrawAddress'
          )
        }
      }
      return null
    case 'withdrawConfirm':
      if (
        currentState.withdrawCoinAmount &&
        currentState.withdrawAddress &&
        msg.text &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-withdraw-cryptocurrency-button`)
      ) {
        const {
          cryptoCurrencyAmount,
          cryptoCurrency
        } = currentState.withdrawCoinAmount
        if (
          processWithdrawal(
            cryptoCurrencyAmount,
            currentState.withdrawAddress,
            cryptoCurrency
          )
        ) {
          return await nextWalletState(
            currentState,
            telegramId,
            'showWithdrawSuccess'
          )
        } else {
          logger.error(`Withdraw processing error: walletParser#withdrawConfirm 
          
          ${JSON.stringify(currentState)}
          `)
          return await nextWalletState(
            currentState,
            telegramId,
            'showWithdrawError'
          )
        }
      }
      return null
    default:
      return null
  }
}
