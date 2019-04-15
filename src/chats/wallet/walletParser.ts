import { WalletState, nextWalletState } from './WalletState'
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
    default:
      return null
  }
}
