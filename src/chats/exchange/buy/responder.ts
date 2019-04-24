import { BuyStateKey } from './types'
import { Responder } from 'chats/types'
import * as _ from 'lodash'
import { ExchangeState } from '../ExchangeState'
import { BuyMessage } from './messages'

export const BuyResponder: Responder<ExchangeState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<BuyStateKey, () => Promise<boolean>> = {
    [BuyStateKey.cb_buy]: async () => {
      return false
    },
    [BuyStateKey.buy_show]: async () => {
      await BuyMessage(msg, user).showBuyMessage()
      return true
    }
  }

  return resp[currentState.currentStateKey as BuyStateKey]()
}
