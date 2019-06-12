import { CONFIG } from '../../../config'
import { Trade, User, TelegramAccount } from 'models'
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

      await telegramHook.getWebhook.sendMessage(
        contextTUser.id,
        contextUser.t(`${Namespace.Exchange}:deals.trade.init-get-confirm`, {
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
    _trade: Trade,
    _contextUser: User,
    _contextTUser: TelegramAccount
  ) {
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
  },
  [TradeStatus.REJECTED]: async function(
    _trade: Trade,
    _contextUser: User,
    _contextTUser: TelegramAccount
  ) {
    return false
  }
}
