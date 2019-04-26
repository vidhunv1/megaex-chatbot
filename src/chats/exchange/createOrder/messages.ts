import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType } from 'models'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import {
  CreateOrderStateKey,
  CreateOrderState,
  CreateOrderError
} from './types'
import { CryptoCurrency } from 'constants/currencies'
import { ExchangeSource } from 'constants/exchangeSource'

export const CreateOrderMessage = (msg: TelegramBot.Message, user: User) => ({
  async showCreateOrderMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.show`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(
                  `${Namespace.Exchange}:create-order.new-buy-order-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  CreateOrderStateKey.cb_createNewOrder,
                  CreateOrderState[CreateOrderStateKey.cb_createNewOrder]
                >(CreateOrderStateKey.cb_createNewOrder, {
                  orderType: OrderType.BUY,
                  data: null
                })
              }
            ],
            [
              {
                text: user.t(
                  `${Namespace.Exchange}:create-order.new-sell-order-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  CreateOrderStateKey.cb_createNewOrder,
                  CreateOrderState[CreateOrderStateKey.cb_createNewOrder]
                >(CreateOrderStateKey.cb_createNewOrder, {
                  orderType: OrderType.SELL,
                  data: null
                })
              }
            ]
          ]
        }
      }
    )
  },

  async inputRateFixedPrice(
    cryptoCurrencyCode: CryptoCurrency,
    fiatMarketRate: number,
    orderType: OrderType,
    shouldEdit: boolean
  ) {
    const text = user.t(`${Namespace.Exchange}:create-order.input-fixed-rate`, {
      fiatCurrencyCode: user.currencyCode,
      cryptoCurrencyCode,
      marketRate: fiatMarketRate
    })
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: user.t(
                `${Namespace.Exchange}:create-order.use-margin-price-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                CreateOrderStateKey.cb_useMarginPrice,
                CreateOrderState[CreateOrderStateKey.cb_useMarginPrice]
              >(CreateOrderStateKey.cb_useMarginPrice, {
                orderType,
                data: null
              })
            }
          ]
        ]
      }
    }

    if (shouldEdit) {
      await telegramHook.getWebhook.editMessageText(text, {
        ...options,
        chat_id: msg.chat.id,
        message_id: msg.message_id
      })
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, text, options)
    }
  },

  async inputRateMarginPrice(
    cryptoCurrencyCode: CryptoCurrency,
    fiatMarketRate: number,
    orderType: OrderType,
    marketRateSource: ExchangeSource,
    shouldEdit: boolean
  ) {
    const text = user.t(
      `${Namespace.Exchange}:create-order.input-margin-rate`,
      {
        fiatCurrencyCode: user.currencyCode,
        cryptoCurrencyCode,
        marketRate: fiatMarketRate,
        marketRateSource
      }
    )
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: user.t(
                `${Namespace.Exchange}:create-order.use-fixed-price-cbbutton`
              ),
              callback_data: stringifyCallbackQuery<
                CreateOrderStateKey.cb_useFixedPrice,
                CreateOrderState[CreateOrderStateKey.cb_useFixedPrice]
              >(CreateOrderStateKey.cb_useFixedPrice, {
                orderType,
                data: null
              })
            }
          ]
        ]
      }
    }
    if (shouldEdit) {
      await telegramHook.getWebhook.editMessageText(text, {
        ...options,
        chat_id: msg.chat.id,
        message_id: msg.message_id
      })
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, text, options)
    }
  },

  async inputLimits(marketRate: number) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.input-amount-limits`, {
        marketRate,
        fiatCurrencyCode: user.currencyCode
      }),
      {
        parse_mode: 'Markdown'
      }
    )
  },

  async buyOrderCreated() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.buy-order-created`)
    )
  },

  async showCreateOrderError(errorType: CreateOrderError): Promise<boolean> {
    switch (errorType) {
      case CreateOrderError.ERROR_CREATE_BUY_ORDER:
        await await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Exchange}:create-order.create-error`),
          {
            parse_mode: 'Markdown'
          }
        )
        return true
      case CreateOrderError.ERROR_CREATE_SELL_ORDER:
        await await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Exchange}:create-order.create-error`),
          {
            parse_mode: 'Markdown'
          }
        )
        return true
    }
  }
})
