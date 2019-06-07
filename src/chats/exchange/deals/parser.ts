import { DealsStateKey, DealsError, DealsState } from './types'
import { Parser } from 'chats/types'
import {
  ExchangeState,
  ExchangeStateKey,
  updateNextExchangeState
} from '../ExchangeState'
import * as _ from 'lodash'
import { parseCurrencyAmount } from 'chats/utils/currency-utils'
import { Order, User, TelegramAccount, TradeError } from 'models'
import { logger, telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import { Trade } from 'models'
import { stringifyCallbackQuery } from 'chats/utils'

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
      const order = await getOrder(orderId)
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
      const order = await getOrder(orderId)
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
    [DealsStateKey.cb_respondDealInit]: async () => {
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
            const isInitialized = await sendOpenDealRequest(
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
              const tradeInfo = await initOpenTrade(
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
    default:
      return null
  }
}

async function sendOpenDealRequest(
  orderId: number,
  requesterUser: User,
  requestorTelegram: TelegramAccount,
  dealFiatAmount: number
) {
  logger.warn(
    'TODO: Potential area for spamming. deals/parser sendOpenDealRequest'
  )
  const order = await getOrder(orderId)

  if (!order) {
    return false
  }

  const op = await User.findById(order.userId, {
    include: [{ model: TelegramAccount }]
  })

  if (!op) {
    return false
  }

  logger.info(
    `deals/parser/sendOpenDealRequest: /O${orderId} requester: ${
      requesterUser.id
    } to user ${order.userId}`
  )

  const dealCryptoAmount: number =
    dealFiatAmount /
    (await Order.convertToFixedRate(
      order.rate,
      order.rateType,
      order.cryptoCurrencyCode,
      order.fiatCurrencyCode,
      order.user.exchangeRateSource
    ))

  await telegramHook.getWebhook.sendMessage(
    op.telegramUser.id,
    op.t(`${Namespace.Exchange}:deals.request-deposit-notify`, {
      orderId: order.id,
      requesterName: requestorTelegram.firstName,
      requesterUsername: requestorTelegram.username,
      formattedFiatValue: dataFormatter.formatFiatCurrency(
        dealFiatAmount,
        order.fiatCurrencyCode
      ),
      formattedCryptoValue: dataFormatter.formatCryptoCurrency(
        dealCryptoAmount,
        order.cryptoCurrencyCode
      )
    }),
    {
      parse_mode: 'Markdown'
    }
  )
  return true
}

async function initOpenTrade(
  orderId: number,
  fiatAmount: number,
  fixedRate: number,
  openedByUser: User
): Promise<Trade | null> {
  const cryptoAmount: number = fiatAmount / fixedRate

  const trade = await Trade.initiateTrade(
    openedByUser.id,
    orderId,
    cryptoAmount,
    fixedRate
  )
  const order = await Order.getOrder(orderId)
  if (!order) {
    logger.error('deals/parser/initOpenTrade No order found')
    return null
  }

  const telegramAccountOP = await TelegramAccount.findOne({
    where: {
      userId: order.userId
    }
  })
  // send message to OP
  if (!telegramAccountOP) {
    throw new Error('No Telegram account found')
  }

  await telegramHook.getWebhook.sendMessage(
    telegramAccountOP.id,
    order.user.t(`${Namespace.Exchange}:deals.trade.init-get-confirm`, {
      tradeId: trade.id,
      requestorAccountId: openedByUser.accountId,
      cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
        cryptoAmount,
        order.cryptoCurrencyCode
      ),
      fiatValue: dataFormatter.formatFiatCurrency(
        fiatAmount,
        order.fiatCurrencyCode
      )
    }),
    {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: order.user.t(
                `${Namespace.Exchange}:deals.trade.trade-init-yes-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                DealsStateKey.cb_respondDealInit,
                DealsState[DealsStateKey.cb_respondDealInit]
              >(DealsStateKey.cb_respondDealInit, {
                confirmation: 'yes'
              })
            },
            {
              text: order.user.t(
                `${Namespace.Exchange}:deals.trade.trade-init-no-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                DealsStateKey.cb_respondDealInit,
                DealsState[DealsStateKey.cb_respondDealInit]
              >(DealsStateKey.cb_respondDealInit, {
                confirmation: 'no'
              })
            }
          ]
        ]
      }
    }
  )

  return trade
}

async function getOrder(orderId: number) {
  return await Order.getOrder(orderId)
}
