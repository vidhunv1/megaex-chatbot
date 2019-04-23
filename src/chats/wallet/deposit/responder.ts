import { DepositStateKey } from './types'
import { Responder } from 'chats/types'
import { WalletState } from '../WalletState'
import { DepositMessage } from './messages'

export const DepositResponder: Responder<WalletState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<DepositStateKey, () => Promise<boolean>> = {
    [DepositStateKey.depositCoin_show]: async () => {
      const addressState = currentState[DepositStateKey.depositCoin_show]
      if (!addressState || !addressState.address) {
        return false
      }
      const currencyCode = addressState.currencyCode

      await DepositMessage(msg, user).showDepositAddress(
        addressState.address,
        currencyCode
      )
      return true
    },

    [DepositStateKey.cb_depositCoin]: async () => {
      return false
    }
  }

  return resp
}
