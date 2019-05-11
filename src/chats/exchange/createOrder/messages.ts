import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType, PaymentMethodFields, RateType } from 'models'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import {
  CreateOrderStateKey,
  CreateOrderState,
  CreateOrderError
} from './types'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { ExchangeSource } from 'constants/exchangeSource'
import { PaymentMethodPrimaryFieldIndex } from 'constants/paymentMethods'
import { PaymentMethodType } from 'models'
import { MyOrdersMessage } from '../myOrders'
import { dataFormatter } from 'utils/dataFormatter'

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
    const formattedMarketRate = dataFormatter.formatFiatCurrency(
      fiatMarketRate,
      user.currencyCode
    )
    const text = user.t(
      `${Namespace.Exchange}:create-order.input-margin-rate`,
      {
        fiatCurrencyCode: user.currencyCode,
        cryptoCurrencyCode,
        marketRate: formattedMarketRate,
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

  async inputLimits() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.input-amount-limits`, {
        marketRate: 1000,
        fiatCurrencyCode: user.currencyCode
      }),
      {
        parse_mode: 'Markdown'
      }
    )
  },

  async buyOrderCreated(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCurrencyCode: FiatCurrency,
    rate: number,
    rateType: RateType,
    amount: {
      min: number
      max: number
    },
    paymentMethod: PaymentMethodType,
    isEnabled: boolean,
    terms: string | null
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.buy-order-created`),
      {
        parse_mode: 'Markdown'
      }
    )

    await MyOrdersMessage(msg, user).showMyBuyOrder(
      orderId,
      cryptoCurrencyCode,
      fiatCurrencyCode,
      rate,
      rateType,
      amount,
      paymentMethod,
      isEnabled,
      terms,
      false,
      false,
      false
    )
  },

  async sellOrderCreated(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCurrencyCode: FiatCurrency,
    rate: number,
    rateType: RateType,
    amount: {
      min: number
      max: number
    },
    availableBalance: number,
    paymentMethod: PaymentMethodType,
    paymentMethodFields: string[],
    isEnabled: boolean,
    terms: string | null
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.sell-order-created`),
      {
        parse_mode: 'Markdown'
      }
    )

    await MyOrdersMessage(msg, user).showMySellOrder(
      orderId,
      cryptoCurrencyCode,
      fiatCurrencyCode,
      rate,
      rateType,
      amount,
      availableBalance,
      paymentMethod,
      paymentMethodFields,
      isEnabled,
      terms,
      false,
      false,
      false
    )
  },

  async showCreateOrderError(errorType: CreateOrderError): Promise<boolean> {
    switch (errorType) {
      case CreateOrderError.ERROR_CREATE_BUY_ORDER:
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Exchange}:create-order.create-error`),
          {
            parse_mode: 'Markdown'
          }
        )
        return true
      case CreateOrderError.ERROR_CREATE_SELL_ORDER:
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Exchange}:create-order.create-error`),
          {
            parse_mode: 'Markdown'
          }
        )
        return true
    }
  },

  async selectSellPaymentMethod(
    pmList: PaymentMethodType[],
    addedPM: PaymentMethodFields[]
  ) {
    const inline1: TelegramBot.InlineKeyboardButton[][] = pmList.map((pm) => [
      {
        text: user.t(`payment-methods.names.${pm}`),
        callback_data: stringifyCallbackQuery<
          CreateOrderStateKey.cb_selectPaymentMethod,
          CreateOrderState[CreateOrderStateKey.cb_selectPaymentMethod]
        >(CreateOrderStateKey.cb_selectPaymentMethod, {
          pm
        })
      }
    ])

    const inline2: TelegramBot.InlineKeyboardButton[][] = addedPM.map((pm) => [
      {
        text: `${user.t(
          `payment-methods.short-names.${pm.paymentMethod}`
        )}-${pm.fields[
          PaymentMethodPrimaryFieldIndex[pm.paymentMethod]
        ].substring(0, 4)}***`,
        callback_data: stringifyCallbackQuery<
          CreateOrderStateKey.cb_selectPaymentMethod,
          CreateOrderState[CreateOrderStateKey.cb_selectPaymentMethod]
        >(CreateOrderStateKey.cb_selectPaymentMethod, {
          pm: pm.paymentMethod,
          pmId: pm.id
        })
      }
    ])

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.select-payment-method`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [...inline2, ...inline1]
        }
      }
    )
  },

  async selectBuyPaymentMethod(pmList: PaymentMethodType[]) {
    const inline: TelegramBot.InlineKeyboardButton[][] = pmList.map((pm) => [
      {
        text: user.t(`payment-methods.names.${pm}`),
        callback_data: stringifyCallbackQuery<
          CreateOrderStateKey.cb_selectPaymentMethod,
          CreateOrderState[CreateOrderStateKey.cb_selectPaymentMethod]
        >(CreateOrderStateKey.cb_selectPaymentMethod, {
          pm
        })
      }
    ])

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.select-payment-method`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  }
})
