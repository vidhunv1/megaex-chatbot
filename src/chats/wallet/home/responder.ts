import { WalletHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { WalletState } from '../WalletState'
import * as _ from 'lodash'
import { WalletHomeMessage } from './messages'

export const WalletResponder: Responder<WalletState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<WalletHomeStateKey, () => Promise<boolean>> = {
    [WalletHomeStateKey.wallet]: async () => {
      const walletData = _.get(
        currentState[WalletHomeStateKey.start],
        'data',
        null
      )
      if (!walletData) {
        return false
      }

      const {
        cryptoCurrencyCode,
        cryptoBalance,
        fiatCurrencyCode,
        fiatValue,
        blockedBalance,
        referralCount,
        earnings
      } = walletData
      await WalletHomeMessage(msg, user).showWalletHome(
        cryptoCurrencyCode,
        cryptoBalance,
        fiatCurrencyCode,
        fiatValue,
        blockedBalance,
        earnings,
        referralCount
      )

      return true
    },

    [WalletHomeStateKey.start]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as WalletHomeStateKey]()
}
