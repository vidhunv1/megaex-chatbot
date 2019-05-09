import { DealsStateKey } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState,
  TradeStatus
} from '../ExchangeState'
import * as _ from 'lodash'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { OrderType } from 'models'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { PaymentMethodType } from 'models'
import logger from 'modules/Logger'

export const DealsParser: Parser<ExchangeState> = async (
  msg,
  user,
  tUser,
  state
) => {
  const parser: Record<DealsStateKey, () => Promise<ExchangeState | null>> = {
    [DealsStateKey.cb_deals]: async () => {
      return {
        ...state,
        [DealsStateKey.deals_show]: {
          data: {
            cursor: 0,
            shouldEdit: false
          }
        }
      }
    },
    [DealsStateKey.deals_show]: async () => {
      return null
    },
    [DealsStateKey.cb_showDealById]: async () => {
      return state
    },
    [DealsStateKey.showDealById]: async () => {
      return null
    },
    [DealsStateKey.cb_nextDeals]: async () => {
      const cursor = parseInt(
        _.get(state[DealsStateKey.cb_nextDeals], 'cursor', '0') + ''
      )
      if (cursor === null) {
        return null
      }
      return {
        ...state,
        [DealsStateKey.deals_show]: {
          data: {
            cursor: cursor,
            shouldEdit: true
          }
        }
      }
    },
    [DealsStateKey.cb_prevDeals]: async () => {
      const cursor = parseInt(
        _.get(state[DealsStateKey.cb_prevDeals], 'cursor', '0') + ''
      )
      if (cursor === null) {
        return null
      }
      return {
        ...state,
        [DealsStateKey.deals_show]: {
          data: {
            cursor: cursor,
            shouldEdit: true
          }
        }
      }
    },

    [DealsStateKey.cb_openDeal]: async () => {
      const orderId = _.get(state[DealsStateKey.cb_openDeal], 'orderId', null)
      if (orderId === null) {
        return null
      }

      return {
        ...state,
        [DealsStateKey.inputDealAmount]: {
          data: null,
          orderId,
          jumpState: DealsStateKey.cb_openDeal
        }
      }
    },

    [DealsStateKey.cb_requestDealDeposit]: async () => {
      const orderId = _.get(
        state[DealsStateKey.cb_requestDealDeposit],
        'orderId',
        null
      )
      if (orderId === null) {
        return null
      }

      return {
        ...state,
        [DealsStateKey.inputDealAmount]: {
          data: null,
          orderId,
          jumpState: DealsStateKey.cb_requestDealDeposit
        }
      }
    },
    [DealsStateKey.requestDealDeposit_show]: async () => {
      return null
    },
    [DealsStateKey.inputDealAmount]: async () => {
      const orderId = _.get(
        state[DealsStateKey.inputDealAmount],
        'orderId',
        null
      )
      const jumpState = _.get(
        state[DealsStateKey.inputDealAmount],
        'jumpState',
        null
      )
      if (!msg.text || orderId == null || jumpState == null) {
        return null
      }
      const order = await getOrder(orderId)
      if (order == null) {
        return null
      }

      const parsedValue = parseCurrencyAmount(msg.text, user.currencyCode)
      if (parsedValue == null) {
        return state
      }

      let fiatValue: number | null = null
      if (parsedValue.currencyKind === 'fiat') {
        fiatValue = parsedValue.amount
      } else if (parsedValue.currencyKind === 'crypto') {
        fiatValue = parsedValue.amount * order.rate
      }

      if (fiatValue != null) {
        const cryptoValue = fiatValue / order.rate
        if (cryptoValue < order.amount.min || cryptoValue > order.amount.max) {
          return state
        }

        return {
          ...state,
          [DealsStateKey.inputDealAmount]: {
            orderId,
            jumpState,
            data: {
              fiatValue,
              fiatCurrencyCode: order.fiatCurrencyCode
            }
          }
        }
      }

      return state
    },
    [DealsStateKey.confirmInputDealAmount]: async () => {
      return null
    },
    [DealsStateKey.cb_confirmInputDealAmount]: async () => {
      const isConfirmed: boolean = JSON.parse(
        _.get(
          state[DealsStateKey.cb_confirmInputDealAmount],
          'isConfirmed',
          false
        ) + ''
      )
      const orderId = _.get(
        state[DealsStateKey.inputDealAmount],
        'orderId',
        null
      )
      const inputDealData = _.get(
        state[DealsStateKey.inputDealAmount],
        'data',
        null
      )
      const jumpState = _.get(
        state[DealsStateKey.inputDealAmount],
        'jumpState',
        null
      )

      if (
        isConfirmed &&
        orderId != null &&
        inputDealData != null &&
        jumpState != null
      ) {
        switch (jumpState) {
          case DealsStateKey.cb_requestDealDeposit:
            const isInitialized = await sendOpenDealRequest(orderId)
            return {
              ...state,
              [DealsStateKey.cb_confirmInputDealAmount]: {
                isConfirmed,
                data: {
                  isInitialized: isInitialized
                }
              }
            }
          case DealsStateKey.cb_openDeal:
            const tradeInfo = await initOpenTrade(
              orderId,
              inputDealData.fiatValue,
              user.id
            )
            if (tradeInfo.tradeId) {
              return {
                ...state,
                [DealsStateKey.showDealInitOpened]: {
                  data: {
                    tradeId: tradeInfo.tradeId
                  }
                },
                [DealsStateKey.cb_confirmInputDealAmount]: {
                  isConfirmed,
                  data: {
                    isInitialized: true
                  }
                }
              }
            } else {
              return {
                ...state,
                [DealsStateKey.cb_confirmInputDealAmount]: {
                  isConfirmed,
                  data: {
                    isInitialized: false
                  }
                }
              }
            }
          default:
            return null
        }
      } else {
        return {
          ...state,
          [DealsStateKey.cb_confirmInputDealAmount]: {
            isConfirmed,
            data: {
              isInitialized: false
            }
          }
        }
      }
    },
    [DealsStateKey.showDealInitOpened]: async () => {
      return null
    },
    [DealsStateKey.showDealInitCancel]: async () => {
      return null
    }
  }

  const updatedState = await parser[state.currentStateKey as DealsStateKey]()
  const nextStateKey = nextDealsState(updatedState)
  const nextState = updateNextExchangeState(
    updatedState,
    nextStateKey,
    tUser.id
  )

  return nextState
}

function nextDealsState(state: ExchangeState | null): ExchangeStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case DealsStateKey.cb_deals:
      return DealsStateKey.deals_show
    case DealsStateKey.deals_show:
      return null
    case DealsStateKey.cb_nextDeals:
      return DealsStateKey.deals_show
    case DealsStateKey.cb_prevDeals:
      return DealsStateKey.deals_show
    case DealsStateKey.cb_showDealById:
      return DealsStateKey.showDealById

    case DealsStateKey.cb_requestDealDeposit:
      return DealsStateKey.inputDealAmount
    case DealsStateKey.cb_openDeal:
      return DealsStateKey.inputDealAmount

    case DealsStateKey.inputDealAmount: {
      const amountData = _.get(
        state[DealsStateKey.inputDealAmount],
        'data',
        null
      )
      const jumpState = _.get(
        state[DealsStateKey.inputDealAmount],
        'jumpState',
        null
      )
      if (jumpState == null) {
        return null
      }
      if (amountData != null) {
        return DealsStateKey.confirmInputDealAmount
      }
      return DealsStateKey.inputDealAmount
    }
    case DealsStateKey.cb_confirmInputDealAmount: {
      const amountData = _.get(
        state[DealsStateKey.inputDealAmount],
        'data',
        null
      )
      const jumpState = _.get(
        state[DealsStateKey.inputDealAmount],
        'jumpState',
        null
      )
      const isConfirmed = JSON.parse(
        _.get(
          state[DealsStateKey.cb_confirmInputDealAmount],
          'isConfirmed',
          false
        ) + ''
      )

      if (!isConfirmed) {
        return DealsStateKey.showDealInitCancel
      }
      if (jumpState == null || amountData == null) {
        return null
      }

      if (jumpState === DealsStateKey.cb_requestDealDeposit) {
        return DealsStateKey.requestDealDeposit_show
      } else if (jumpState === DealsStateKey.cb_openDeal) {
        return DealsStateKey.showDealInitOpened
      }

      return null
    }
    default:
      return null
  }
}

async function sendOpenDealRequest(orderId: number) {
  // TODO: Potential area for spamming.
  logger.error('TODO: sendOpenDealRequest for ' + orderId)
  return true
}

async function initOpenTrade(
  orderId: number,
  amount: number,
  openedByUserId: number
) {
  logger.error(`TODO: initOpenTrade ${orderId} ${amount} ${openedByUserId}`)
  return {
    tradeId: 1,
    tradeStatus: TradeStatus.INITIATED
  }
}

async function getOrder(orderId: number) {
  return {
    orderId: orderId,
    orderType: OrderType.BUY,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    fiatCurrencyCode: FiatCurrency.INR,
    rate: 310001,
    rating: 4.9,
    availableBalance: 0.5,
    amount: {
      min: 0.3,
      max: 0.5
    },
    paymentMethod: PaymentMethodType.CASH,
    isEnabled: true,
    terms: 'Please transfer fast..'
  }
}
