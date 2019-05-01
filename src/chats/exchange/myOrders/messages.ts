import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import {
  PaymentMethods,
  PaymentMethodsFieldsLocale
} from 'constants/paymentMethods'
import { CryptoCurrency } from 'constants/currencies'
import { dataFormatter } from 'utils/dataFormatter'
import { linkCreator } from 'utils/linkCreator'
import { stringifyCallbackQuery } from 'chats/utils'
import { MyOrdersStateKey, MyOrdersState } from './types'
import { keyboardMainMenu } from 'chats/common'
import { DepositStateKey, DepositState } from 'chats/wallet/deposit'

export const MyOrdersMessage = (msg: TelegramBot.Message, user: User) => ({
  async showMyOrdersMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.show-orders`),
      {
        parse_mode: 'Markdown'
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
    paymentMethod: PaymentMethods,
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

  async showBuyOrder(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    rate: number,
    amount: {
      min: number
      max: number
    },
    paymentMethod: PaymentMethods,
    isEnabled: boolean,
    terms: string | null,
    showEditOptions: boolean,
    msgEdit: boolean = false
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
      inline = [
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
            text: user.t(
              `${Namespace.Exchange}:my-orders.edit-amount-cbbutton`
            ),
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
              (isEnabled === false ? '  ' : '☑️ ') +
              user.t(`${Namespace.Exchange}:my-orders.toggle-active-cbbutton`),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_toggleActive,
              MyOrdersState[MyOrdersStateKey.cb_toggleActive]
            >(MyOrdersStateKey.cb_toggleActive, {
              orderId: orderId,
              isEnabled
            })
          },
          {
            text: user.t(
              `${Namespace.Exchange}:my-orders.delete-order-cbbutton`
            ),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_deleteOrder,
              MyOrdersState[MyOrdersStateKey.cb_deleteOrder]
            >(MyOrdersStateKey.cb_deleteOrder, {
              orderId: orderId
            })
          }
        ]
      ]
    }
    const formattedRate = dataFormatter.formatFiatCurrency(
      rate,
      user.currencyCode
    )

    const message = user.t(
      `${Namespace.Exchange}:my-orders.my-buy-order-info`,
      {
        orderId: orderId,
        cryptoCurrencyCode,
        rate: formattedRate,
        paymentMethod: user.t(`payment-methods.names.${paymentMethod}`),
        minAmount: amount.min,
        maxAmount: amount.max,
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

  async showSellOrder(
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    rate: number,
    amount: {
      min: number
      max: number
    },
    availableBalance: number,
    paymentMethod: PaymentMethods,
    pmFields: string[],
    isEnabled: boolean,
    terms: string | null,
    showEditOptions: boolean,
    msgEdit: boolean = false
  ) {
    let inline: TelegramBot.InlineKeyboardButton[][]

    if (!showEditOptions) {
      const focusInlineButtons: TelegramBot.InlineKeyboardButton[] = []

      if (amount.max > availableBalance) {
        focusInlineButtons.push({
          text: user.t(`${Namespace.Wallet}:home.my-address`),
          callback_data: stringifyCallbackQuery<
            DepositStateKey.cb_depositCoin,
            DepositState[DepositStateKey.cb_depositCoin]
          >(DepositStateKey.cb_depositCoin, {
            mId: msg.message_id,
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
            pm: paymentMethod
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
              pm: paymentMethod
            })
          }
        ],
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
            text: user.t(
              `${Namespace.Exchange}:my-orders.edit-amount-cbbutton`
            ),
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
              (isEnabled === false ? '  ' : '☑️ ') +
              user.t(`${Namespace.Exchange}:my-orders.toggle-active-cbbutton`),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_toggleActive,
              MyOrdersState[MyOrdersStateKey.cb_toggleActive]
            >(MyOrdersStateKey.cb_toggleActive, {
              orderId: orderId,
              isEnabled
            })
          },
          {
            text: user.t(
              `${Namespace.Exchange}:my-orders.delete-order-cbbutton`
            ),
            callback_data: stringifyCallbackQuery<
              MyOrdersStateKey.cb_deleteOrder,
              MyOrdersState[MyOrdersStateKey.cb_deleteOrder]
            >(MyOrdersStateKey.cb_deleteOrder, {
              orderId: orderId
            })
          }
        ]
      ]
    }
    const formattedRate = dataFormatter.formatFiatCurrency(
      rate,
      user.currencyCode
    )
    let paymentDetails = user.t(`payment-methods.names.${paymentMethod}`)

    pmFields.forEach((field, index) => {
      paymentDetails =
        paymentDetails +
        `\n${user.t(
          `payment-methods.fields.${paymentMethod}.field${index + 1}`
        )}: ${field}`
    })

    const message = user.t(
      `${Namespace.Exchange}:my-orders.my-sell-order-info`,
      {
        orderId: orderId,
        cryptoCurrencyCode,
        rate: formattedRate,
        paymentDetails,
        minAmount: amount.min,
        maxAmount: amount.max,
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

  async showEditPaymentMethod(paymentMethods: PaymentMethods[]) {
    const inline: TelegramBot.InlineKeyboardButton[][] = paymentMethods.map(
      (pm) => [
        {
          text: user.t(`payment-methods.names.${pm}`),
          callback_data: stringifyCallbackQuery<
            MyOrdersStateKey.cb_editPaymentMethodSelected,
            MyOrdersState[MyOrdersStateKey.cb_editPaymentMethodSelected]
          >(MyOrdersStateKey.cb_editPaymentMethodSelected, {
            pm
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
