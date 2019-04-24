import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import { CONFIG } from '../../../config'
import { stringifyCallbackQuery } from 'chats/utils'
import { BuyStateKey, BuyState } from '../buy'
import { SellStateKey, SellState } from '../sell'
import { MyOrdersStateKey, MyOrdersState } from '../myOrders'
import { CreateOrderStateKey, CreateOrderState } from '../createOrder'

export const ExchangeHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  async showExchangeHome() {
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
                  orderCount: 0
                }),
                callback_data: stringifyCallbackQuery<
                  MyOrdersStateKey.cb_myOrders,
                  MyOrdersState[MyOrdersStateKey.cb_myOrders]
                >(MyOrdersStateKey.cb_myOrders, {
                  data: null
                })
              },
              {
                text: user.t(
                  `${Namespace.Exchange}:home.create-order-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  CreateOrderStateKey.cb_createOrder,
                  CreateOrderState[CreateOrderStateKey.cb_createOrder]
                >(CreateOrderStateKey.cb_createOrder, {
                  data: null
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Exchange}:home.buy-cbbutton`),
                callback_data: stringifyCallbackQuery<
                  BuyStateKey.cb_buy,
                  BuyState[BuyStateKey.cb_buy]
                >(BuyStateKey.cb_buy, {
                  data: null
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Exchange}:home.sell-cbbutton`),
                callback_data: stringifyCallbackQuery<
                  SellStateKey.cb_sell,
                  SellState[SellStateKey.cb_sell]
                >(SellStateKey.cb_sell, {
                  data: null
                })
              }
            ]
          ]
        }
      }
    )
  }
})
