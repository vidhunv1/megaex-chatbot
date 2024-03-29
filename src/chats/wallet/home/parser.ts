import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { WalletHomeStateKey } from './types'
import { Parser } from 'chats/types'
import {
  WalletStateKey,
  WalletState,
  updateNextWalletState
} from '../WalletState'
import { Transaction, Market, User, Referral } from 'models'
import { ExchangeSource } from 'constants/exchangeSource'

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
        user,
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
            blockedBalance: await getBlockedBalance(
              user.id,
              cryptoCurrencyCode
            ),
            earnings: await getEarnings(user.id, CURRENT_CURRENCY_CODE),
            referralCount: await getReferralCount(user.id)
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
const getBlockedBalance = async (
  userId: number,
  cryptoCurrency: CryptoCurrency
) => {
  return await Transaction.getBlockedBalance(userId, cryptoCurrency)
}

const getReferralCount = async (userId: number) => {
  const referredUsers = await Referral.getReferredUsers(userId)
  return referredUsers ? referredUsers.length : 0
}

const getEarnings = async (
  userId: number,
  cryptoCurrencyCode: CryptoCurrency
) => {
  return await Transaction.getEarnedComission(userId, cryptoCurrencyCode)
}

const getFiatValue = async (
  amount: number,
  fromCurrency: CryptoCurrency,
  toCurrency: FiatCurrency,
  exchangeSource: ExchangeSource
) => {
  const marketRate = await Market.getFiatValue(
    fromCurrency,
    toCurrency,
    exchangeSource
  )
  return amount * marketRate
}

const getAvailableBalance = async (
  user: User,
  currency: CryptoCurrency,
  fiatCurrency: FiatCurrency
) => {
  const bal = await Transaction.getAvailableBalance(user.id, currency)
  const value = await getFiatValue(
    bal,
    currency,
    fiatCurrency,
    user.exchangeRateSource
  )

  return {
    cryptoAmount: bal,
    fiatValue: value
  }
}
