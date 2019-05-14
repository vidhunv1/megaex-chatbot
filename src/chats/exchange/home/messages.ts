import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType } from 'models'
import { Namespace } from 'modules/i18n'
import { CONFIG } from '../../../config'
import { stringifyCallbackQuery } from 'chats/utils'
import { MyOrdersStateKey, MyOrdersState } from '../myOrders'
import { CreateOrderStateKey, CreateOrderState } from '../createOrder'
import { DealsStateKey, DealsState } from '../deals'

export const ExchangeHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  async showExchangeHome(activeOrdersCount: number) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:home.exchange`, {
        fiatCurrency: user.currencyCode,
        supportBotUsername: `@${CONFIG.SUPPORT_USERNAME}`
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(`${Namespace.Exchange}:home.my-orders-cbbutton`, {
                  orderCount: activeOrdersCount
                }),
                callback_data: stringifyCallbackQuery<
                  MyOrdersStateKey.cb_showActiveOrders,
                  MyOrdersState[MyOrdersStateKey.cb_showActiveOrders]
                >(MyOrdersStateKey.cb_showActiveOrders, {})
              },
              {
                text: user.t(
                  `${Namespace.Exchange}:home.create-order-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  CreateOrderStateKey.cb_showCreateOrder,
                  CreateOrderState[CreateOrderStateKey.cb_showCreateOrder]
                >(CreateOrderStateKey.cb_showCreateOrder, {
                  data: null
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Exchange}:home.buy-cbbutton`),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_deals,
                  DealsState[DealsStateKey.cb_deals]
                >(DealsStateKey.cb_deals, {
                  orderType: OrderType.SELL
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Exchange}:home.sell-cbbutton`),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_deals,
                  DealsState[DealsStateKey.cb_deals]
                >(DealsStateKey.cb_deals, {
                  orderType: OrderType.BUY
                })
              }
            ]
          ]
        }
      }
    )
  }
})
