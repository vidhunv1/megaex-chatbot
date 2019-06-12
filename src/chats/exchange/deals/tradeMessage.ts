import { CONFIG } from '../../../config'
import { Trade, User, TelegramAccount, OrderType, PaymentMethod } from 'models'
import { TradeStatus } from 'models/Trade'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'
import { stringifyCallbackQuery } from 'chats/utils'
import { DealsStateKey, DealsState } from './types'
import { dataFormatter } from 'utils/dataFormatter'
import logger from 'modules/logger'

export const sendTradeMessage: Record<
  TradeStatus,
  (
    trade: Trade,
    contextUser: User,
    contextTUser: TelegramAccount
  ) => Promise<boolean>
> = {
  [TradeStatus.INITIATED]: async function(
    trade: Trade,
    contextUser: User,
    contextTUser: TelegramAccount
  ) {
    // Show opened trade
    const timeoutMinutes = parseInt(CONFIG.TRADE_INIT_TIMEOUT_S) / 60

    if (contextUser.id === trade.createdByUserId) {
      const opUser = await User.findById(trade.getOpUserId())
      if (!opUser) {
        logger.error('sendTradeMessage: no opUser found' + trade.getOpUserId())
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.trade-opened-message`),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(contextUser)
        }
      )

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.show-opened-trade`, {
          tradeId: trade.id,
          traderAccountId: opUser.accountId,
          timeoutMinutes
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: contextUser.t(
                    `${Namespace.Exchange}:deals.cancel-trade-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_cancelTrade,
                    DealsState[DealsStateKey.cb_cancelTrade]
                  >(DealsStateKey.cb_cancelTrade, {
                    tradeId: trade.id
                  })
                }
              ]
            ]
          }
        }
      )

      return true
    } else {
      const openedByUser = await User.findById(trade.createdByUserId)
      if (!openedByUser) {
        logger.error('Opened by user in trade does not exist' + openedByUser)
        return false
      }
      const transKey =
        trade.tradeType === OrderType.BUY
          ? `${Namespace.Exchange}:deals.trade.init-get-confirm-buy`
          : `${Namespace.Exchange}:deals.trade.init-get-confirm-sell`

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(transKey, {
          tradeId: trade.id,
          requestorAccountId: openedByUser.accountId,
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            trade.cryptoAmount,
            trade.cryptoCurrencyCode
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            trade.fiatAmount,
            trade.fiatCurrencyCode
          ),
          fixedRate: dataFormatter.formatFiatCurrency(
            trade.fixedRate,
            trade.fiatCurrencyCode
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: contextUser.t(
                    `${Namespace.Exchange}:deals.trade.trade-init-yes-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_respondToTradeInit,
                    DealsState[DealsStateKey.cb_respondToTradeInit]
                  >(DealsStateKey.cb_respondToTradeInit, {
                    confirmation: 'yes',
                    tradeId: trade.id
                  })
                },
                {
                  text: contextUser.t(
                    `${Namespace.Exchange}:deals.trade.trade-init-no-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_respondToTradeInit,
                    DealsState[DealsStateKey.cb_respondToTradeInit]
                  >(DealsStateKey.cb_respondToTradeInit, {
                    confirmation: 'no',
                    tradeId: trade.id
                  })
                }
              ]
            ]
          }
        }
      )

      return true
    }
  },
  [TradeStatus.ACCEPTED]: async function(
    trade: Trade,
    contextUser: User,
    contextTUser: TelegramAccount
  ) {
    if (contextUser.id === trade.buyerUserId) {
      const sellerTAccount = await TelegramAccount.findOne({
        where: {
          userId: trade.sellerUserId
        }
      })
      if (!sellerTAccount) {
        return false
      }

      const fiatPayAmount = dataFormatter.formatFiatCurrency(
        trade.cryptoAmount * trade.fixedRate,
        trade.fiatCurrencyCode
      )
      let paymentDetails = ''
      if (trade.paymentMethodId) {
        const pm = await PaymentMethod.getPaymentMethod(trade.paymentMethodId)

        if (pm) {
          pm.fields.forEach((field, index) => {
            paymentDetails =
              paymentDetails +
              `${contextUser.t(
                `payment-methods.fields.${pm.paymentMethod}.field${index + 1}`
              )}: ${field}\n`
          })
        }
      } else {
        paymentDetails = contextUser.t(
          `${
            Namespace.Exchange
          }:deals.trade.trade-accepted-buyer-no-payment-info`
        )
      }

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(
          `${Namespace.Exchange}:deals.trade.trade-accepted-buyer`,
          {
            tradeId: trade.id,
            fiatPayAmount: fiatPayAmount,
            paymentMethodName: contextUser.t(
              `payment-methods.names.${trade.paymentMethodType}`
            ),
            telegramUsername: '@' + sellerTAccount.username || '-',
            paymentDetails: paymentDetails,
            paymentSendTimeoutS: (
              parseInt(CONFIG.TRADE_ESCROW_TIMEOUT_S) / 60
            ).toFixed(0),
            cryptoAmount: dataFormatter.formatCryptoCurrency(
              trade.cryptoAmount,
              trade.cryptoCurrencyCode
            )
          }
        ),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: contextUser.t(
                    `${Namespace.Exchange}:deals.trade.payment-sent-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_paymentSent,
                    DealsState[DealsStateKey.cb_paymentSent]
                  >(DealsStateKey.cb_paymentSent, {
                    tradeId: trade.id
                  })
                },
                {
                  text: contextUser.t(
                    `${Namespace.Exchange}:deals.cancel-trade-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_cancelTrade,
                    DealsState[DealsStateKey.cb_cancelTrade]
                  >(DealsStateKey.cb_cancelTrade, {
                    tradeId: trade.id
                  })
                }
              ]
            ]
          }
        }
      )
    } else {
      const buyerAccount = await User.findById(trade.buyerUserId, {
        include: [{ model: TelegramAccount }]
      })
      if (!buyerAccount) return false

      const formattedFiat = dataFormatter.formatFiatCurrency(
        trade.fiatAmount,
        trade.fiatCurrencyCode
      )

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(
          `${Namespace.Exchange}:deals.trade.trade-accepted-seller-success`,
          {
            paymentMethodName: contextUser.t(
              `payment-methods.names.${trade.paymentMethodType}`
            ),
            fiatPayAmount: formattedFiat,
            tradeId: trade.id,
            buyerUsername: buyerAccount.telegramUser.username
              ? '@' + buyerAccount.telegramUser.username
              : ''
          }
        ),
        {
          parse_mode: 'Markdown'
        }
      )
    }
    return false
  },
  [TradeStatus.REJECTED]: async function(
    trade: Trade,
    contextUser: User,
    contextTUser: TelegramAccount
  ) {
    if (contextUser.id === trade.getOpUserId()) {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(
          `${Namespace.Exchange}:deals.trade.trade-rejected-success`
        ),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(contextUser)
        }
      )
    } else {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(
          `${Namespace.Exchange}:deals.trade.trade-rejected-notify`,
          {
            tradeId: trade.id
          }
        ),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(contextUser)
        }
      )
    }
    return false
  },
  [TradeStatus.CANCELED]: async function(
    trade: Trade | null,
    contextUser: User,
    contextTUser: TelegramAccount
  ) {
    if (trade && contextUser.id === trade.getOpUserId()) {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.trade.cancel-trade-notify`, {
          tradeId: trade.id
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(contextUser)
        }
      )
      return true
    } else {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.trade.cancel-trade-success`),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(contextUser)
        }
      )
      return true
    }
  },
  [TradeStatus.EXPIRED]: async function(
    trade: Trade,
    contextUser: User,
    contextTUser: TelegramAccount
  ) {
    if (contextUser.id === trade.createdByUserId) {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(
          `${Namespace.Exchange}:deals.trade.trade-init-no-response`
        ),
        {
          parse_mode: 'Markdown'
        }
      )
    } else {
      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.trade.trade-init-expired`, {
          tradeId: trade.id
        }),
        {
          parse_mode: 'Markdown'
        }
      )
    }

    return true
  },
  [TradeStatus.PAYMENT_DISPUTE]: async function(
    _trade: Trade,
    _contextUser: User,
    _contextTUser: TelegramAccount
  ) {
    return false
  },
  [TradeStatus.PAYMENT_RELEASED]: async function(
    _trade: Trade,
    _contextUser: User,
    _contextTUser: TelegramAccount
  ) {
    return false
  },
  [TradeStatus.PAYMENT_SENT]: async function(
    _trade: Trade,
    _contextUser: User,
    _contextTUser: TelegramAccount
  ) {
    return false
  }
}
