import { telegramHook } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import {
  User,
  OrderType,
  TradeError,
  TradeErrorTypes,
  PaymentMethodFields
} from 'models'
import { Namespace } from 'modules/i18n'
import { PaymentMethodType } from 'models'
import * as _ from 'lodash'
import { stringifyCallbackQuery } from 'chats/utils'
import { DealsStateKey, DealsState, DealsError } from './types'
import { dataFormatter } from 'utils/dataFormatter'
import { FiatCurrency, CryptoCurrency } from 'constants/currencies'
import { DealsConfig } from './config'
import * as moment from 'moment'
import { LanguageISO } from 'constants/languages'
import { CommonStateKey, CommonState } from 'chats/common/types'
import { AccountHomeStateKey, AccountHomeState } from 'chats/account/home'
import { keyboardMainMenu } from 'chats/common'
import { linkCreator } from 'utils/linkCreator'
import { PaymentMethodPrimaryFieldIndex } from 'constants/paymentMethods'
import {
  PaymentMethodState,
  PaymentMethodStateKey
} from 'chats/account/paymentMethods'
import { CreateOrderStateKey, CreateOrderState } from '../createOrder'

export const DealsMessage = (msg: TelegramBot.Message, user: User) => ({
  async inputPaymentDetails(
    paymentMethodType: PaymentMethodType,
    pms: PaymentMethodFields[]
  ) {
    const inline: TelegramBot.InlineKeyboardButton[][] = pms.map((pm) => [
      {
        text:
          user.t(`payment-methods.names.${pm.paymentMethod}`) +
          `- ${pm.fields[PaymentMethodPrimaryFieldIndex[pm.paymentMethod]]}`,
        callback_data: stringifyCallbackQuery<
          DealsStateKey.cb_selectPaymentDetail,
          DealsState[DealsStateKey.cb_selectPaymentDetail]
        >(DealsStateKey.cb_selectPaymentDetail, {
          pmId: pm.id
        })
      }
    ])
    inline.push([
      {
        text: user.t(`${Namespace.Exchange}:deals.skip-input-payment-details`),
        callback_data: stringifyCallbackQuery<
          DealsStateKey.cb_selectPaymentDetail,
          DealsState[DealsStateKey.cb_selectPaymentDetail]
        >(DealsStateKey.cb_selectPaymentDetail, {
          pmId: null
        })
      },
      {
        text: user.t(`${Namespace.Exchange}:deals.add-payment-details`, {
          paymentMethodName: user.t(
            `payment-methods.names.${paymentMethodType}`
          )
        }),
        callback_data: stringifyCallbackQuery<
          PaymentMethodStateKey.cb_addPaymentMethod,
          PaymentMethodState[PaymentMethodStateKey.cb_addPaymentMethod]
        >(PaymentMethodStateKey.cb_addPaymentMethod, {
          data: null,
          pmSelected: paymentMethodType
        })
      }
    ])
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.input-payment-details`, {
        paymentMethodType: paymentMethodType
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  },
  async cancelTradeConfirm(
    tradeId: number,
    fiatAmount: number,
    fiatCurrencyCode: FiatCurrency
  ) {
    const f = dataFormatter.formatFiatCurrency(fiatAmount, fiatCurrencyCode)
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.cancel-trade-confirm`, {
        fiatAmount: f,
        tradeId: tradeId
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.cancel-trade-confirm-yes-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_cancelTradeConfirm,
                  DealsState[DealsStateKey.cb_cancelTradeConfirm]
                >(DealsStateKey.cb_cancelTradeConfirm, {
                  tradeId,
                  confirmation: 'yes'
                })
              },
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.cancel-trade-confirm-no-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_cancelTradeConfirm,
                  DealsState[DealsStateKey.cb_cancelTradeConfirm]
                >(DealsStateKey.cb_cancelTradeConfirm, {
                  tradeId,
                  confirmation: 'no'
                })
              }
            ]
          ]
        }
      }
    )
  },
  async cancelTradeBadFail() {
    const transKey = `${Namespace.Exchange}:deals.trade.cancel-trade-fail`
    await telegramHook.getWebhook.sendMessage(msg.chat.id, user.t(transKey), {
      parse_mode: 'Markdown',
      reply_markup: keyboardMainMenu(user)
    })
  },

  async showAcceptDealError() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.trade-accepted-fail`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async confirmPaymentSent(
    tradeId: number,
    fiatAmount: number,
    fiatCurrency: FiatCurrency,
    paymentMethod: PaymentMethodType
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.confirm-payment-sent`, {
        fiatAmount: dataFormatter.formatFiatCurrency(fiatAmount, fiatCurrency),
        paymentMethodType: user.t(`payment-methods.names.${paymentMethod}`)
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.confirm-payment-sent-yes-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_confirmPaymentSent,
                  DealsState[DealsStateKey.cb_confirmPaymentSent]
                >(DealsStateKey.cb_confirmPaymentSent, {
                  tradeId: tradeId,
                  confirmation: 'yes'
                })
              },
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.confirm-payment-sent-no-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_confirmPaymentSent,
                  DealsState[DealsStateKey.cb_confirmPaymentSent]
                >(DealsStateKey.cb_confirmPaymentSent, {
                  tradeId: tradeId,
                  confirmation: 'no'
                })
              }
            ]
          ]
        }
      }
    )
  },

  async getReview() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.give-review`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: user.t(`${Namespace.Exchange}:deals.trade.skip-review`) }]
          ],
          one_time_keyboard: false,
          resize_keyboard: true
        }
      }
    )
  },

  async endReview() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.end-review`, {
        referralLink: linkCreator.getReferralLink(user.accountId)
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async confirmPaymentReceived(
    tradeId: number,
    fiatAmount: number,
    fiatCurrency: FiatCurrency
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.trade.confirm-payment-received`, {
        fiatAmount: dataFormatter.formatFiatCurrency(fiatAmount, fiatCurrency)
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.confirm-payment-received-yes-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_confirmPaymentReceived,
                  DealsState[DealsStateKey.cb_confirmPaymentReceived]
                >(DealsStateKey.cb_confirmPaymentReceived, {
                  tradeId: tradeId,
                  confirmation: 'yes'
                })
              },
              {
                text: user.t(
                  `${
                    Namespace.Exchange
                  }:deals.trade.confirm-payment-received-no-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_confirmPaymentReceived,
                  DealsState[DealsStateKey.cb_confirmPaymentReceived]
                >(DealsStateKey.cb_confirmPaymentReceived, {
                  tradeId: tradeId,
                  confirmation: 'no'
                })
              }
            ]
          ]
        }
      }
    )
  },

  async showDealsError(error: DealsError | TradeErrorTypes) {
    let transKey = ''
    switch (error) {
      case DealsError.SELF_OPEN_DEAL_REQUEST:
        transKey = user.t(
          `${Namespace.Exchange}:deals.errors.${
            DealsError.SELF_OPEN_DEAL_REQUEST
          }`
        )
        break
      case DealsError.ORDER_NOT_FOUND:
        transKey = user.t(
          `${Namespace.Exchange}:deals.errors.${DealsError.ORDER_NOT_FOUND}`
        )
        break
      case TradeError.INSUFFICIENT_BALANCE:
        transKey = user.t(
          `${Namespace.Exchange}:deals.trade.errors.${
            TradeError.INSUFFICIENT_BALANCE
          }`
        )
        break
      case TradeErrorTypes.TRADE_EXISTS_ON_ORDER:
        transKey = user.t(
          `${Namespace.Exchange}:deals.trade.errors.${
            TradeError.TRADE_EXISTS_ON_ORDER
          }`
        )
        break
      default:
        transKey = user.t(`${Namespace.Exchange}:deals.errors.default`)
    }
    await telegramHook.getWebhook.sendMessage(msg.chat.id, transKey, {
      parse_mode: 'Markdown',
      reply_markup: keyboardMainMenu(user)
    })
  },

  async showOpenDealRequest(sellerTelegramUsername: string) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.show-open-deal-request`, {
        telegramUsername: sellerTelegramUsername
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async confirmInputDealAmount(
    orderType: OrderType,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCurrencyCode: FiatCurrency,
    fiatValue: number,
    fixedRate: number
  ) {
    const formattedCryptoValue = dataFormatter.formatCryptoCurrency(
      fiatValue / fixedRate,
      cryptoCurrencyCode
    )
    const formattedFiatValue = dataFormatter.formatFiatCurrency(
      fiatValue,
      fiatCurrencyCode
    )
    const formattedRate = dataFormatter.formatFiatCurrency(
      fixedRate,
      fiatCurrencyCode
    )
    let message
    if (orderType === OrderType.BUY) {
      message = user.t(
        `${Namespace.Exchange}:deals.confirm-input-sell-amount`,
        {
          cryptoValue: formattedCryptoValue,
          fiatValue: formattedFiatValue,
          rate: formattedRate
        }
      )
    } else {
      message = user.t(`${Namespace.Exchange}:deals.confirm-input-buy-amount`, {
        cryptoValue: formattedCryptoValue,
        fiatValue: formattedFiatValue,
        rate: formattedRate
      })
    }

    await telegramHook.getWebhook.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: user.t(
                `${Namespace.Exchange}:deals.confirm-input-amount-yes-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                DealsStateKey.cb_confirmInputDealAmount,
                DealsState[DealsStateKey.cb_confirmInputDealAmount]
              >(DealsStateKey.cb_confirmInputDealAmount, {
                isConfirmed: true,
                data: null
              })
            },
            {
              text: user.t(
                `${Namespace.Exchange}:deals.confirm-input-amount-no-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                DealsStateKey.cb_confirmInputDealAmount,
                DealsState[DealsStateKey.cb_confirmInputDealAmount]
              >(DealsStateKey.cb_confirmInputDealAmount, {
                isConfirmed: false,
                data: null
              })
            }
          ]
        ]
      }
    })
  },

  async inputDealAmount(
    orderType: OrderType,
    fiatCurrencyCode: FiatCurrency,
    fixedRate: number,
    cryptoCurrencyCode: CryptoCurrency,
    minFiat: number,
    maxFiat: number
  ) {
    const minCryptoValue = dataFormatter.formatCryptoCurrency(
      minFiat / fixedRate,
      cryptoCurrencyCode
    )
    const maxCryptoValue = dataFormatter.formatCryptoCurrency(
      maxFiat / fixedRate,
      cryptoCurrencyCode
    )
    const minFiatValue = dataFormatter.formatFiatCurrency(
      minFiat,
      fiatCurrencyCode
    )
    const maxFiatValue = dataFormatter.formatFiatCurrency(
      maxFiat,
      fiatCurrencyCode
    )

    let message
    if (orderType === OrderType.BUY) {
      message = user.t(`${Namespace.Exchange}:deals.input-sell-amount`, {
        minFiatValue: minFiatValue,
        maxFiatValue: maxFiatValue,
        minCryptoValue: minCryptoValue,
        maxCryptoValue: maxCryptoValue,
        cryptoCurrencyCode: cryptoCurrencyCode,
        fiatCurrencyCode: fiatCurrencyCode
      })
    } else {
      message = user.t(`${Namespace.Exchange}:deals.input-buy-amount`, {
        minFiatValue: minFiatValue,
        maxFiatValue: maxFiatValue,
        minCryptoValue: minCryptoValue,
        maxCryptoValue: maxCryptoValue,
        cryptoCurrencyCode: cryptoCurrencyCode,
        fiatCurrencyCode: fiatCurrencyCode
      })
    }
    await telegramHook.getWebhook.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        one_time_keyboard: true,
        resize_keyboard: true,
        keyboard: [
          [
            {
              text: user.t('actions.cancel-keyboard-button')
            }
          ]
        ]
      }
    })
  },

  async showError(dealsError: DealsError) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.errors.${dealsError}`)
    )
  },

  async showDealsMessage(
    cryptoCurrencyCode: CryptoCurrency,
    orderType: OrderType,
    ordersList: {
      id: number
      userId: number
      fixedRate: number
      paymentMethodType: PaymentMethodType
      fiatCurrencyCode: FiatCurrency
      rating: number
      availableBalance: number
      minFiatAmount: number
    }[],
    totalOrders: number,
    currentCursor: number,
    shouldEdit: boolean
  ) {
    let inline: TelegramBot.InlineKeyboardButton[][] = ordersList.map(
      (order) => {
        const formattedFiatRateRate = dataFormatter.formatFiatCurrency(
          order.fixedRate,
          order.fiatCurrencyCode
        )

        let text = `${formattedFiatRateRate} - ${user.t(
          `payment-methods.short-names.${order.paymentMethodType}`
        )} | ${order.rating.toFixed(1)} ⭐️`

        if (order.userId === user.id) {
          text = '*' + text
        }

        if (
          order.availableBalance < order.minFiatAmount &&
          orderType === OrderType.SELL
        ) {
          text = '❗️' + text
        }
        return [
          {
            text,
            callback_data: stringifyCallbackQuery<
              DealsStateKey.cb_showDealById,
              DealsState[DealsStateKey.cb_showDealById]
            >(DealsStateKey.cb_showDealById, {
              orderId: order.id
            })
          }
        ]
      }
    )

    let nextPageCursor = currentCursor
    let nextPageText = user.t(`${Namespace.Exchange}:deals.next-cbbutton`)
    let prevPageText = user.t(`${Namespace.Exchange}:deals.prev-cbbutton`)
    let prevPageCursor = currentCursor
    if (currentCursor - DealsConfig.LIST_LIMIT >= 0) {
      prevPageCursor = currentCursor - DealsConfig.LIST_LIMIT
      prevPageText = '« ' + prevPageText
    }

    if (currentCursor + DealsConfig.LIST_LIMIT < totalOrders) {
      nextPageCursor = currentCursor + DealsConfig.LIST_LIMIT
      nextPageText = nextPageText + ' »'
    }

    if (totalOrders > DealsConfig.LIST_LIMIT) {
      inline.push([
        {
          text: prevPageText,
          callback_data: stringifyCallbackQuery<
            DealsStateKey.cb_prevDeals,
            DealsState[DealsStateKey.cb_prevDeals]
          >(DealsStateKey.cb_prevDeals, {
            cursor: prevPageCursor
          })
        },
        {
          text: nextPageText,
          callback_data: stringifyCallbackQuery<
            DealsStateKey.cb_nextDeals,
            DealsState[DealsStateKey.cb_nextDeals]
          >(DealsStateKey.cb_nextDeals, {
            cursor: nextPageCursor
          })
        }
      ])
    }

    let text
    const totalPages = Math.ceil(totalOrders / DealsConfig.LIST_LIMIT)
    const currentPage = Math.ceil((currentCursor + 1) / DealsConfig.LIST_LIMIT)

    if (orderType === OrderType.SELL) {
      if (totalPages === 0) {
        text = user.t(`${Namespace.Exchange}:deals.no-quick-sell`)

        inline = [
          [
            {
              text: user.t(
                `${Namespace.Exchange}:deals.new-quick-sell-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                CreateOrderStateKey.cb_createNewOrder,
                CreateOrderState[CreateOrderStateKey.cb_createNewOrder]
              >(CreateOrderStateKey.cb_createNewOrder, {
                orderType: OrderType.BUY,
                data: null
              })
            }
          ]
        ]
      } else {
        text = user.t(`${Namespace.Exchange}:deals.show-buy-deals`, {
          cryptoCurrencyCode,
          currentPage: currentPage,
          totalPages: totalPages
        })
      }
    } else {
      if (totalPages === 0) {
        text = user.t(`${Namespace.Exchange}:deals.no-quick-buy`)

        inline = [
          [
            {
              text: user.t(
                `${Namespace.Exchange}:deals.new-quick-buy-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                CreateOrderStateKey.cb_createNewOrder,
                CreateOrderState[CreateOrderStateKey.cb_createNewOrder]
              >(CreateOrderStateKey.cb_createNewOrder, {
                orderType: OrderType.BUY,
                data: null
              })
            }
          ]
        ]
      } else {
        text = user.t(`${Namespace.Exchange}:deals.show-sell-deals`, {
          cryptoCurrencyCode,
          currentPage: currentPage,
          totalPages: totalPages
        })
      }
    }

    if (shouldEdit) {
      try {
        await telegramHook.getWebhook.editMessageText(text, {
          message_id: msg.message_id,
          chat_id: msg.chat.id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: inline
          }
        })
      } catch (e) {
        // todo: to Ignore the editing unchanged message error ///
      }
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      })
    }
  },

  async showDealInitCancel() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:deals.show-open-deal-cancel`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async showDeal(
    orderType: OrderType,
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    realName: string,
    accountId: string,
    lastSeen: Date,
    rating: number,
    tradeCount: number,
    terms: string,
    paymentMethod: PaymentMethodType,
    fixedRate: number, // Margin rates needs to be converted to fixed
    amount: { min: number; max: number },
    availableBalanceInFiat: number,
    fiatCurrencyCode: FiatCurrency,
    reviewCount: number
  ) {
    // If orderType = Buy, then it is Sell when shown to the user
    const lastSeenValue = moment(lastSeen)
      .locale(LanguageISO[user.locale])
      .fromNow()
    const formattedRate = dataFormatter.formatFiatCurrency(
      fixedRate,
      fiatCurrencyCode
    )
    const formattedTerms = terms != null ? terms : '-'

    let openDealInline: TelegramBot.InlineKeyboardButton, showDealText
    if (orderType === OrderType.BUY) {
      const formattedAmount = `${
        amount.min
      } - ${dataFormatter.formatFiatCurrency(amount.max, fiatCurrencyCode)}`

      openDealInline = {
        text: user.t(`${Namespace.Exchange}:deals.open-sell-deal-cbbutton`, {
          cryptoCurrencyCode
        }),
        callback_data: stringifyCallbackQuery<
          DealsStateKey.cb_openDeal,
          DealsState[DealsStateKey.cb_openDeal]
        >(DealsStateKey.cb_openDeal, {
          orderId,
          orderType: orderType
        })
      }

      showDealText = user.t(`${Namespace.Exchange}:deals.show-sell-deal`, {
        orderId,
        cryptoCurrencyCode,
        realName,
        accountId,
        lastSeenValue,
        rating: rating.toFixed(1),
        tradeCount,
        terms: formattedTerms,
        paymentMethodName: user.t(`payment-methods.names.${paymentMethod}`),
        rate: formattedRate,
        formattedAmount
      })
    } else {
      const actualMaxAmount =
        availableBalanceInFiat >= amount.min &&
        availableBalanceInFiat < amount.max
          ? availableBalanceInFiat
          : amount.max

      const formattedAmount = `${
        amount.min
      } - ${dataFormatter.formatFiatCurrency(
        actualMaxAmount,
        fiatCurrencyCode
      )}`

      showDealText = user.t(`${Namespace.Exchange}:deals.show-buy-deal`, {
        orderId,
        cryptoCurrencyCode,
        realName,
        accountId,
        lastSeenValue,
        rating: rating.toFixed(1),
        tradeCount,
        terms: formattedTerms,
        paymentMethodName: user.t(`payment-methods.names.${paymentMethod}`),
        rate: formattedRate,
        formattedAmount
      })

      if (availableBalanceInFiat < amount.min) {
        showDealText =
          showDealText +
          '\n\n' +
          user.t(`${Namespace.Exchange}:deals.show-sell-insufficient-funds`)

        openDealInline = {
          text: user.t(
            `${Namespace.Exchange}:deals.request-buy-deal-deposit-cbbutton`,
            {
              cryptoCurrencyCode
            }
          ),
          callback_data: stringifyCallbackQuery<
            DealsStateKey.cb_requestDealDeposit,
            DealsState[DealsStateKey.cb_requestDealDeposit]
          >(DealsStateKey.cb_requestDealDeposit, {
            orderId
          })
        }
      } else {
        openDealInline = {
          text: user.t(`${Namespace.Exchange}:deals.open-buy-deal-cbbutton`, {
            cryptoCurrencyCode
          }),
          callback_data: stringifyCallbackQuery<
            DealsStateKey.cb_openDeal,
            DealsState[DealsStateKey.cb_openDeal]
          >(DealsStateKey.cb_openDeal, {
            orderId,
            orderType: orderType
          })
        }
      }
    }

    const inline: TelegramBot.InlineKeyboardButton[][] = []

    inline.push([
      {
        text: user.t(`${Namespace.Exchange}:deals.back-cbbutton`),
        callback_data: stringifyCallbackQuery<
          CommonStateKey.cb_deleteThisMessage,
          CommonState[CommonStateKey.cb_deleteThisMessage]
        >(CommonStateKey.cb_deleteThisMessage, {})
      }
    ])

    if (reviewCount > 0) {
      inline[inline.length - 1].push({
        text: user.t(`${Namespace.Exchange}:deals.user-reviews`),
        callback_data: stringifyCallbackQuery<
          AccountHomeStateKey.cb_showReviews,
          AccountHomeState[AccountHomeStateKey.cb_showReviews]
        >(AccountHomeStateKey.cb_showReviews, {
          accountId: accountId
        })
      })
    }

    inline.push([openDealInline])

    await telegramHook.getWebhook.sendMessage(msg.chat.id, showDealText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inline
      }
    })
  }
})
