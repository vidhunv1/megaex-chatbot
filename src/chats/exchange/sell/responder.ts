import { SellStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { SellMessage } from './messages'

export const SellResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<SellStateKey, () => Promise<boolean>> = {
    [SellStateKey.cb_sell]: async () => {
      return false
    },
    [SellStateKey.sell_show]: async () => {
      await SellMessage(msg, user).showSellMessage()
      return true
    }
  }

  return resp[currentState.currentStateKey as SellStateKey]()
}
