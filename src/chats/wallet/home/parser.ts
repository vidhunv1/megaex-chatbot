import { logger } from 'modules'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { WalletHomeStateKey } from './types'
import { Parser } from 'chats/types'
import {
  WalletStateKey,
  WalletState,
  updateNextWalletState
} from '../WalletState'
import { Transaction } from 'models'

const CURRENT_CURRENCY_CODE = CryptoCurrency.BTC

export const WalletHomeParser: Parser<WalletState> = async (
  _msg,
  user,
  tUser,
  currentState
) => {
  const parser: Record<
    WalletHomeStateKey,
    () => Promise<WalletState | null>
  > = {
    [WalletHomeStateKey.start]: async () => {
      const cryptoCurrencyCode = CURRENT_CURRENCY_CODE
      const { cryptoAmount, fiatValue } = await getAvailableBalance(
        user.id,
        CURRENT_CURRENCY_CODE,
        user.currencyCode
      )
      const fiatCurrencyCode = user.currencyCode
      return {
        ...currentState,
        [WalletHomeStateKey.start]: {
          data: {
            cryptoCurrencyCode,
            cryptoBalance: cryptoAmount,
            fiatValue: fiatValue,
            fiatCurrencyCode,
            blockedBalance: getBlockedBalance(cryptoCurrencyCode),
            earnings: getEarnings(),
            referralCount: getReferralCount()
          }
        }
      }
    },
    [WalletHomeStateKey.wallet]: async () => null
  }

  const updatedState = await parser[
    currentState.currentStateKey as WalletHomeStateKey
  ]()
  const nextStateKey = nextWalletHomeState(updatedState)
  const nextState = updateNextWalletState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextWalletHomeState(
  state: WalletState | null
): WalletStateKey | null {
  if (state === null) {
    return null
  }
  switch (state.currentStateKey) {
    case WalletHomeStateKey.start:
      return WalletHomeStateKey.wallet
    case WalletHomeStateKey.wallet:
      return null
    default:
      return null
  }
}

// Getters
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

const getFiatValue = (
  amount: number,
  _fromCurrency: CryptoCurrency,
  _toCurrency: FiatCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount * 300000
}

const getAvailableBalance = async (
  userId: number,
  currency: CryptoCurrency,
  fiatCurrency: FiatCurrency
) => {
  const bal = await Transaction.getAvailableBalance(userId, currency)
  const value = await getFiatValue(bal, currency, fiatCurrency)

  return {
    cryptoAmount: bal,
    fiatValue: value
  }
}
