import { telegramHook } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType, RateType } from 'models'
import { Namespace } from 'modules/i18n'
import {
  PaymentMethodsFieldsLocale,
  PaymentMethodPrimaryFieldIndex
} from 'constants/paymentMethods'
import { PaymentMethodType } from 'models'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { dataFormatter } from 'utils/dataFormatter'
import { linkCreator } from 'utils/linkCreator'
import { stringifyCallbackQuery } from 'chats/utils'
import { MyOrdersStateKey, MyOrdersState } from './types'
import { keyboardMainMenu } from 'chats/common'
import { DepositStateKey, DepositState } from 'chats/wallet/deposit'
import * as _ from 'lodash'

const formatRate = (
  rate: number,
  rateType: RateType,
  fiatCode: FiatCurrency
) => {
  if (rateType === RateType.FIXED) {
    return dataFormatter.formatFiatCurrency(rate, fiatCode)
  } else {
    return `${rate}%`
  }
}

const getEditOrderInline = (
  orderId: number,
  isOrderActive: boolean,
  user: User
) => {
  const inline: TelegramBot.InlineKeyboardButton[][] = [
    [
      {
        text: user.t(`${Namespace.Exchange}:my-orders.edit-rate-cbbutton`),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_editRate,
          MyOrdersState[MyOrdersStateKey.cb_editRate]
        >(MyOrdersStateKey.cb_editRate, {
          orderId
        })
      },
      {
        text: user.t(`${Namespace.Exchange}:my-orders.edit-amount-cbbutton`),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_editAmount,
          MyOrdersState[MyOrdersStateKey.cb_editAmount]
        >(MyOrdersStateKey.cb_editAmount, {
          orderId: orderId
        })
      }
    ],
    [
      {
        text: user.t(`${Namespace.Exchange}:my-orders.edit-terms-cbbutton`),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_editTerms,
          MyOrdersState[MyOrdersStateKey.cb_editTerms]
        >(MyOrdersStateKey.cb_editTerms, {
          orderId: orderId
        })
      },
      {
        text: user.t(
          `${Namespace.Exchange}:my-orders.edit-payment-method-cbbutton`
        ),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_editPaymentMethod,
          MyOrdersState[MyOrdersStateKey.cb_editPaymentMethod]
        >(MyOrdersStateKey.cb_editPaymentMethod, {
          orderId: orderId
        })
      }
    ],
    [
      {
        text:
          (isOrderActive === false ? '  ' : '☑️ ') +
          user.t(`${Namespace.Exchange}:my-orders.toggle-active-cbbutton`),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_toggleActive,
          MyOrdersState[MyOrdersStateKey.cb_toggleActive]
        >(MyOrdersStateKey.cb_toggleActive, {
          orderId: orderId,
          isEnabled: isOrderActive
        })
      },
      {
        text: user.t(`${Namespace.Exchange}:my-orders.delete-order-cbbutton`),
        callback_data: stringifyCallbackQuery<
          MyOrdersStateKey.cb_deleteOrder,
          MyOrdersState[MyOrdersStateKey.cb_deleteOrder]
        >(MyOrdersStateKey.cb_deleteOrder, {
          orderId: orderId
        })
      }
    ]
  ]

  return inline
}
export const MyOrdersMessage = (msg: TelegramBot.Message, user: User) => ({
  async showActiveOrders(
    activeOrders: {
      createdBy: number
      orderType: OrderType
      paymentMethod: PaymentMethodType
      rate: number
      fiatCurrencyCode: FiatCurrency
      orderId: number
    }[]
  ) {
    activeOrders = _.sortBy(activeOrders, (a) => a.createdBy === user.id)
    const inline: TelegramBot.InlineKeyboardButton[][] = activeOrders.map(
      (order) => {
        const formattedFiatRate = dataFormatter.formatFiatCurrency(
          order.rate,
          order.fiatCurrencyCode
        )
        let text
        if (order.createdBy === user.id) {
          if (order.orderType === OrderType.BUY) {
            text = user.t(
              `${Namespace.Exchange}:my-orders.my-buy-order-cbbutton`,
              {
                paymentMethod: user.t(
                  `payment-methods.short-names.${order.paymentMethod}`
                )
              }
            )
          } else {
            text = user.t(
              `${Namespace.Exchange}:my-orders.my-sell-order-cbbutton`,
              {
                paymentMethod: user.t(
                  `payment-methods.short-names.${order.paymentMethod}`
                )
              }
            )
          }
        } else {
          if (order.orderType === OrderType.BUY) {
            text = user.t(`${Namespace.Exchange}:my-orders.buy-deal-cbbutton`, {
              fiatRate: formattedFiatRate
            })
          } else {
            text = user.t(
              `${Namespace.Exchange}:my-orders.sell-deal-cbbutton`,
              {
                fiatRate: formattedFiatRate
              }
            )
          }
        }

        return [
          {
            text,
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_showOrderById,
              MyOrdersState[MyOrdersStateKey.cb_showOrderById]
            >(MyOrdersStateKey.cb_showOrderById, {
              orderId: order.orderId
            })
          }
        ]
      }
    )
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.show-active-orders`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  },

  async showDeleteSuccess() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.order-delete-success`),
      {
        parse_mode: 'Markdown'
      }
    )
  },

  async inputPaymentDetails(
    paymentMethod: PaymentMethodType,
    nextInputFieldIndex: number
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.input-payment-details-field`, {
        paymentMethod: user.t(`payment-methods.names.${paymentMethod}`),
        fieldName: user.t(
          `payment-methods.fields.${paymentMethod}.field${nextInputFieldIndex}`
        )
      }),
      {
        parse_mode: 'Markdown'
      }
    )
  },

  async showEditRate(cryptoCurrencyCode: CryptoCurrency, marketRate: number) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.order-edit-rate`, {
        cryptoCurrencyCode,
        marketRate
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t('actions.cancel-keyboard-button')
              }
            ]
          ]
        }
      }
    )

    return true
  },

  async showEditAmount(marketRate: number) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:create-order.input-amount-limits`, {
        marketRate,
        fiatCurrencyCode: user.currencyCode
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t('actions.cancel-keyboard-button')
              }
            ]
          ]
        }
      }
    )
  },

  async showEditTerms() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.order-edit-terms`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t('actions.cancel-keyboard-button')
              }
            ]
          ]
        }
      }
    )
  },

  async showEditSuccess() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.order-edit-success`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async showMyBuyOrder(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCode: FiatCurrency,
    rate: number,
    rateType: RateType,
    amount: {
      min: number
      max: number
    },
    paymentMethod: PaymentMethodType,
    isEnabled: boolean,
    terms: string | null,
    showEditOptions: boolean,
    msgEdit: boolean,
    showBackButton: boolean
  ) {
    let inline: TelegramBot.InlineKeyboardButton[][]

    if (!showEditOptions) {
      inline = [
        [
          {
            text: user.t(`${Namespace.Exchange}:my-orders.edit-order`),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_editOrder,
              MyOrdersState[MyOrdersStateKey.cb_editOrder]
            >(MyOrdersStateKey.cb_editOrder, {
              orderId: orderId
            })
          }
        ]
      ]
    } else {
      inline = getEditOrderInline(orderId, isEnabled, user)
    }

    if (showBackButton) {
      inline.push([
        {
          text: user.t(`${Namespace.Exchange}:my-orders.go-back-cbbutton`),
          callback_data: stringifyCallbackQuery<
            MyOrdersStateKey.cb_showOrder_back,
            MyOrdersState[MyOrdersStateKey.cb_showOrder_back]
          >(MyOrdersStateKey.cb_showOrder_back, {
            orderId: orderId
          })
        }
      ])
    }

    const formattedRate = formatRate(rate, rateType, fiatCode)
    const formattedMinAmount = dataFormatter.formatFiatCurrency(
      amount.min,
      fiatCode
    )
    const formattedMaxAmount = dataFormatter.formatFiatCurrency(
      amount.max,
      fiatCode
    )

    const message = user.t(
      `${Namespace.Exchange}:my-orders.my-buy-order-info`,
      {
        orderId: orderId,
        cryptoCurrencyCode,
        rate: formattedRate,
        paymentMethod: user.t(`payment-methods.names.${paymentMethod}`),
        fiatCurrencyCode: fiatCode,
        minAmount: formattedMinAmount,
        maxAmount: formattedMaxAmount,
        status: user.t(
          `${Namespace.Exchange}:my-orders.${
            isEnabled === true ? 'order-enabled' : 'order-disabled'
          }`
        ),
        orderLink: linkCreator.getOrderLink(orderId),
        terms:
          terms != null && terms != ''
            ? `" ${terms} "`
            : user.t(`${Namespace.Exchange}:my-orders.terms-not-added`)
      }
    )
    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inline
      }
    }

    if (msgEdit) {
      await telegramHook.getWebhook.editMessageText(message, {
        ...options,
        message_id: msg.message_id,
        chat_id: msg.chat.id
      })
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, message, options)
    }
  },

  async showMySellOrder(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCurrencyCode: FiatCurrency,
    rate: number,
    rateType: RateType,
    walletFiatValue: number,
    amount: {
      min: number
      max: number
    },
    _availableCryptoBalance: number,
    paymentMethod: PaymentMethodType,
    pmFields: string[],
    isEnabled: boolean,
    terms: string | null,
    showEditOptions: boolean,
    msgEdit: boolean,
    showBackButton: boolean
  ) {
    let inline: TelegramBot.InlineKeyboardButton[][]
    if (!showEditOptions) {
      const focusInlineButtons: TelegramBot.InlineKeyboardButton[] = []
      if (amount.min > walletFiatValue) {
        focusInlineButtons.push({
          text: user.t(
            `${Namespace.Exchange}:my-orders.deposit-cryptocurrency`,
            { cryptoCurrencyCode: cryptoCurrencyCode }
          ),
          callback_data: stringifyCallbackQuery<
            DepositStateKey.cb_depositCoin,
            DepositState[DepositStateKey.cb_depositCoin]
          >(DepositStateKey.cb_depositCoin, {
            currencyCode: cryptoCurrencyCode
          })
        })
      }

      if (pmFields.length < PaymentMethodsFieldsLocale[paymentMethod].length) {
        focusInlineButtons.push({
          text: user.t(`${Namespace.Exchange}:my-orders.edit-payment-details`),
          callback_data: stringifyCallbackQuery<
            MyOrdersStateKey.cb_editPaymentDetails,
            MyOrdersState[MyOrdersStateKey.cb_editPaymentDetails]
          >(MyOrdersStateKey.cb_editPaymentDetails, {
            pm: paymentMethod,
            orderId
          })
        })
      }
      inline = [
        [...focusInlineButtons],
        [
          {
            text: user.t(`${Namespace.Exchange}:my-orders.edit-order`),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_editOrder,
              MyOrdersState[MyOrdersStateKey.cb_editOrder]
            >(MyOrdersStateKey.cb_editOrder, {
              orderId: orderId
            })
          }
        ]
      ]
    } else {
      inline = [
        [
          {
            text: user.t(
              `${Namespace.Exchange}:my-orders.edit-payment-details`
            ),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_editPaymentDetails,
              MyOrdersState[MyOrdersStateKey.cb_editPaymentDetails]
            >(MyOrdersStateKey.cb_editPaymentDetails, {
              pm: paymentMethod,
              orderId
            })
          }
        ],
        ...getEditOrderInline(orderId, isEnabled, user)
      ]
    }

    if (showBackButton) {
      inline.push([
        {
          text: user.t(`${Namespace.Exchange}:my-orders.go-back-cbbutton`),
          callback_data: stringifyCallbackQuery<
            MyOrdersStateKey.cb_showOrder_back,
            MyOrdersState[MyOrdersStateKey.cb_showOrder_back]
          >(MyOrdersStateKey.cb_showOrder_back, {
            orderId: orderId
          })
        }
      ])
    }

    const formattedRate = formatRate(rate, rateType, fiatCurrencyCode)
    const formattedMinAmount = dataFormatter.formatFiatCurrency(
      amount.min,
      fiatCurrencyCode
    )
    const formattedMaxAmount = dataFormatter.formatFiatCurrency(
      amount.max,
      fiatCurrencyCode
    )

    let paymentInfo = ''
    pmFields.forEach((field, index) => {
      paymentInfo =
        paymentInfo +
        `\n  ${user.t(
          `payment-methods.fields.${paymentMethod}.field${index + 1}`
        )} - ${field}`
    })

    if (pmFields.length === 0) {
      paymentInfo = user.t(
        `${Namespace.Exchange}:my-orders.payment-info-not-added`
      )
    }

    let message = user.t(`${Namespace.Exchange}:my-orders.my-sell-order-info`, {
      orderId: orderId,
      cryptoCurrencyCode,
      rate: formattedRate,
      paymentMethod: user.t(`payment-methods.names.${paymentMethod}`),
      paymentInfo,
      minAmount: formattedMinAmount,
      maxAmount: formattedMaxAmount,
      status: user.t(
        `${Namespace.Exchange}:my-orders.${
          isEnabled === true ? 'order-enabled' : 'order-disabled'
        }`
      ),
      orderLink: linkCreator.getOrderLink(orderId),
      terms:
        terms != null && terms != ''
          ? `" ${terms} "`
          : user.t(`${Namespace.Exchange}:my-orders.terms-not-added`)
    })

    if (amount.min > walletFiatValue) {
      message =
        message +
        `\n${user.t(
          `${Namespace.Exchange}:my-orders.insufficient-sell-order-balance`
        )}`
    }

    const options = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inline
      }
    }

    if (msgEdit) {
      await telegramHook.getWebhook.editMessageText(message, {
        ...options,
        message_id: msg.message_id,
        chat_id: msg.chat.id
      })
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, message, options)
    }
  },

  async showEditPaymentMethod(
    paymentMethods: {
      paymentMethod: PaymentMethodType
      pmId: number | null
      pmFields: string[] | null
    }[]
  ) {
    const inline: TelegramBot.InlineKeyboardButton[][] = paymentMethods.map(
      (pm) => [
        {
          text:
            pm.pmFields && pm.pmId
              ? `${user.t(`payment-methods.short-names.${pm.paymentMethod}`)}-${
                  pm.pmFields[PaymentMethodPrimaryFieldIndex[pm.paymentMethod]]
                }`
              : user.t(`payment-methods.names.${pm.paymentMethod}`),
          callback_data: stringifyCallbackQuery<
            MyOrdersStateKey.cb_editPaymentMethodSelected,
            MyOrdersState[MyOrdersStateKey.cb_editPaymentMethodSelected]
          >(MyOrdersStateKey.cb_editPaymentMethodSelected, {
            pm: pm.paymentMethod,
            pmId: pm.pmId
          })
        }
      ]
    )

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
