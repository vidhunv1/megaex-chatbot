import { DealsStateKey, DealsError } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { Order, TradeError } from 'models'
import { dealUtils } from './dealUtils'
import logger from 'modules/logger'

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
      const order = await dealUtils.getOrder(orderId)
      if (!order) return null

      if (order.userId === user.id) {
        return {
          ...state,
          [DealsStateKey.cb_openDeal]: {
            error: DealsError.SELF_OPEN_DEAL_REQUEST,
            orderId
          }
        }
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
      const order = await dealUtils.getOrder(orderId)
      if (!order) return null

      if (order.userId === user.id) {
        return {
          ...state,
          [DealsStateKey.cb_requestDealDeposit]: {
            orderId,
            error: DealsError.SELF_OPEN_DEAL_REQUEST
          }
        }
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
      const order = await dealUtils.getOrder(orderId)
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
        fiatValue =
          parsedValue.amount *
          (await Order.convertToFixedRate(
            order.rate,
            order.rateType,
            order.cryptoCurrencyCode,
            order.fiatCurrencyCode,
            order.user.exchangeRateSource
          ))
      }
      if (fiatValue != null) {
        if (
          fiatValue < order.minFiatAmount ||
          fiatValue > order.maxFiatAmount
        ) {
          return state
        }

        return {
          ...state,
          [DealsStateKey.inputDealAmount]: {
            orderId,
            jumpState,
            data: {
              fiatValue,
              fiatCurrencyCode: order.fiatCurrencyCode,
              fixedRate: await Order.convertToFixedRate(
                order.rate,
                order.rateType,
                order.cryptoCurrencyCode,
                order.fiatCurrencyCode,
                order.user.exchangeRateSource
              )
            },
            error: null
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
            const isInitialized = await dealUtils.sendOpenDealRequest(
              orderId,
              user,
              tUser,
              parseInt(inputDealData.fiatValue + '')
            )
            return {
              ...state,
              [DealsStateKey.cb_confirmInputDealAmount]: {
                isConfirmed,
                data: {
                  isInitialized: isInitialized
                }
              }
            }
          case DealsStateKey.cb_openDeal: {
            try {
              const tradeInfo = await dealUtils.initOpenTrade(
                orderId,
                inputDealData.fiatValue,
                inputDealData.fixedRate,
                user
              )

              if (!tradeInfo) {
                return {
                  ...state,
                  [DealsStateKey.cb_openDeal]: {
                    orderId,
                    error: DealsError.DEFAULT
                  }
                }
              }

              if (tradeInfo.id) {
                return {
                  ...state,
                  [DealsStateKey.showDealInitOpened]: {
                    data: {
                      tradeId: tradeInfo.id
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
            } catch (e) {
              if (e instanceof TradeError) {
                return {
                  ...state,
                  [DealsStateKey.cb_confirmInputDealAmount]: {
                    isConfirmed,
                    data: null,
                    error: e.status
                  }
                }
              } else {
                return {
                  ...state,
                  [DealsStateKey.cb_confirmInputDealAmount]: {
                    isConfirmed,
                    data: null,
                    error: DealsError.DEFAULT
                  }
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
    },
    [DealsStateKey.dealError]: async () => {
      return null
    },

    [DealsStateKey.cb_respondToTradeInit]: async () => {
      const confirmation = _.get(
        state[DealsStateKey.cb_respondToTradeInit],
        'confirmation',
        null
      )
      const tradeId = parseInt(
        _.get(state[DealsStateKey.cb_respondToTradeInit], 'tradeId', null) + ''
      )

      if (confirmation === null || tradeId === null) {
        return null
      }
      if (confirmation === 'yes') {
        try {
          const trade = await dealUtils.acceptTrade(tUser, tradeId)
          if (!trade) {
            logger.error(
              'deals/parser/acceptTrade error accepting trade, trade is null'
            )
            throw new Error('Error accetpting trade')
          }
          return {
            ...state,
            [DealsStateKey.cb_respondToTradeInit]: {
              confirmation: confirmation,
              tradeId: tradeId,
              data: {
                openedTradeId: _.get(trade, 'id', null)
              },
              error: null
            }
          }
        } catch (e) {
          return {
            ...state,
            [DealsStateKey.cb_respondToTradeInit]: {
              confirmation: confirmation,
              tradeId: tradeId,
              data: null,
              error: e instanceof TradeError ? e.status : DealsError.DEFAULT
            }
          }
        }
      } else {
        try {
          const trade = await dealUtils.rejectTrade(tradeId)
          if (!trade) {
            logger.error(
              'deals/parser/acceptTrade error rejecting trade, trade is null'
            )
            throw new Error('Error rejecting trade')
          }
          return {
            ...state,
            [DealsStateKey.cb_respondToTradeInit]: {
              confirmation: confirmation,
              tradeId: tradeId,
              data: {
                openedTradeId: null
              },
              error: null
            }
          }
        } catch (e) {
          return {
            ...state,
            [DealsStateKey.cb_respondToTradeInit]: {
              confirmation: confirmation,
              tradeId: tradeId,
              data: null,
              error: e instanceof TradeError ? e.status : DealsError.DEFAULT
            }
          }
        }
      }
    },
    [DealsStateKey.respondToTradeInit]: async () => {
      return state
    },
    [DealsStateKey.cb_cancelTrade]: async () => {
      const tradeId = _.get(
        state[DealsStateKey.cb_cancelTrade],
        'tradeId',
        null
      )
      if (tradeId) {
        const canceledTrade = await dealUtils.cancelTrade(tradeId)
        return {
          ...state,
          [DealsStateKey.cancelTrade]: {
            data: {
              canceledTradeId: canceledTrade ? canceledTrade.id : null
            }
          }
        }
      }

      return null
    },
    [DealsStateKey.cancelTrade]: async () => {
      return null
    },
    [DealsStateKey.cb_confirmPaymentSent]: async () => {
      return null
    },
    [DealsStateKey.cb_confirmPaymentReceived]: async () => {
      return null
    },
    [DealsStateKey.cb_paymentDispute]: async () => {
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

    case DealsStateKey.cb_requestDealDeposit: {
      const dealError = _.get(
        state[DealsStateKey.cb_requestDealDeposit],
        'error',
        null
      )

      if (dealError) {
        return DealsStateKey.dealError
      }

      return DealsStateKey.inputDealAmount
    }

    case DealsStateKey.cb_openDeal: {
      const dealError = _.get(state[DealsStateKey.cb_openDeal], 'error', null)
      if (dealError) {
        return DealsStateKey.dealError
      }

      return DealsStateKey.inputDealAmount
    }

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
      const dealError = _.get(
        state[DealsStateKey.cb_confirmInputDealAmount],
        'error',
        null
      )
      if (dealError) {
        return DealsStateKey.dealError
      }

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
    case DealsStateKey.dealError:
      return null

    case DealsStateKey.cb_cancelTrade:
      return DealsStateKey.cancelTrade
    case DealsStateKey.cb_respondToTradeInit:
      const dealError = _.get(
        state[DealsStateKey.cb_respondToTradeInit],
        'error',
        null
      )
      if (dealError) {
        return DealsStateKey.dealError
      }

      return DealsStateKey.respondToTradeInit
    default:
      return null
  }
}
