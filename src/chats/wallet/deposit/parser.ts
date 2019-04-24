import logger from 'modules/Logger'
import { CryptoCurrency } from 'constants/currencies'
import { DepositStateKey, DepositState } from './types'
import { Parser } from 'chats/types'
import {
  WalletStateKey,
  WalletState,
  updateNextWalletState
} from '../WalletState'

export const DepositParser: Parser<WalletState> = async (
  _msg,
  _user,
  tUser,
  currentState
) => {
  const parser: Record<DepositStateKey, () => Promise<WalletState | null>> = {
    [DepositStateKey.cb_depositCoin]: async () => {
      const depositCoinState: DepositState[DepositStateKey.cb_depositCoin] =
        currentState[DepositStateKey.cb_depositCoin]
      if (!depositCoinState) {
        logger.error(
          `unhandled at WalletParser ${DepositStateKey.cb_depositCoin}`
        )
        return null
      }

      const currencyCode = depositCoinState.currencyCode
      return {
        ...currentState,
        [DepositStateKey.depositCoin_show]: {
          address: await getWalletAddress(currencyCode),
          currencyCode
        }
      }
    },

    [DepositStateKey.depositCoin_show]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as DepositStateKey
  ]()
  const nextStateKey = nextDepositState(updatedState)
  const nextState = updateNextWalletState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextDepositState(
  state: WalletState | null
): WalletStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case DepositStateKey.cb_depositCoin:
      return DepositStateKey.depositCoin_show
    case DepositStateKey.depositCoin_show:
      return null
    default:
      return null
  }
}

// Getters
const getWalletAddress = async (_currencyCode: CryptoCurrency) => {
  return 'asdlkjasdkjashdashdk'
}
