import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CONFIG } from '../../config'
import { stringifyCallbackQuery } from 'chats/utils'
import { ExchangeState, ExchangeStateKey } from './ExchangeState'
import { CryptoCurrency } from 'constants/currencies'

const CURRENT_CURRENCY_CODE = CryptoCurrency.BTC

export async function exchangeResponder(
  msg: TelegramBot.Message,
  user: User,
  nextState: ExchangeState
): Promise<boolean> {
  const stateKey = nextState.currentStateKey
  switch (stateKey) {
    case ExchangeStateKey.exchange:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Exchange}:exchange-home`, {
          fiatCurrency: user.currencyCode,
          supportBotUsername: `@${CONFIG.SUPPORT_USERNAME}`
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Exchange}:my-orders`, {
                    orderCount: 0
                  }),
                  callback_data: stringifyCallbackQuery<
                    ExchangeStateKey.cb_myOrders,
                    ExchangeState[ExchangeStateKey.cb_myOrders]
                  >(ExchangeStateKey.cb_myOrders, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CURRENCY_CODE
                  })
                },
                {
                  text: user.t(`${Namespace.Exchange}:create-order`),
                  callback_data: stringifyCallbackQuery<
                    ExchangeStateKey.cb_createOrder,
                    ExchangeState[ExchangeStateKey.cb_createOrder]
                  >(ExchangeStateKey.cb_createOrder, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CURRENCY_CODE
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Exchange}:buy`),
                  callback_data: stringifyCallbackQuery<
                    ExchangeStateKey.cb_buy,
                    ExchangeState[ExchangeStateKey.cb_buy]
                  >(ExchangeStateKey.cb_buy, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CURRENCY_CODE
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Exchange}:sell`),
                  callback_data: stringifyCallbackQuery<
                    ExchangeStateKey.cb_sell,
                    ExchangeState[ExchangeStateKey.cb_sell]
                  >(ExchangeStateKey.cb_sell, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CURRENCY_CODE
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    default:
      return false
  }
}
