import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { CONFIG } from '../../../config'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'
import { stringifyCallbackQuery } from 'chats/utils'
import { PaymentMethodStateKey, PaymentMethodState } from './types'
import { PaymentMethodType, PaymentMethodFields } from 'models/PaymentMethod'
import { PaymentMethodPrimaryFieldIndex } from 'constants/paymentMethods'

export const PaymentMethodMessage = (msg: TelegramBot.Message, user: User) => ({
  async pmDoesNotExist() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.does-not-exist`, {
        supportBotUsername: CONFIG.SUPPORT_USERNAME
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async pmCreateError() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.create-error`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async showPaymentMethods(addedPaymentMethods: PaymentMethodFields[]) {
    const inline: TelegramBot.InlineKeyboardButton[][] = []
    addedPaymentMethods.length > 0 &&
      inline.push([
        {
          text: user.t(`${Namespace.Account}:payment-method.edit-cbbutton`),
          callback_data: stringifyCallbackQuery<
            PaymentMethodStateKey.cb_editPaymentMethods,
            PaymentMethodState[PaymentMethodStateKey.cb_paymentMethods]
          >(PaymentMethodStateKey.cb_editPaymentMethods, {
            data: null
          })
        }
      ])
    inline.push([
      {
        text: user.t(`${Namespace.Account}:payment-method.add-cbbutton`),
        callback_data: stringifyCallbackQuery<
          PaymentMethodStateKey.cb_addPaymentMethod,
          PaymentMethodState[PaymentMethodStateKey.cb_addPaymentMethod]
        >(PaymentMethodStateKey.cb_addPaymentMethod, {
          data: null
        })
      }
    ])

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.show-all`, {
        paymentMethodsList: stringifyPaymentMethodsFields(
          addedPaymentMethods,
          user
        )
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  },

  async showEditPaymentMethod(addedPaymentMethods: PaymentMethodFields[]) {
    const inline: TelegramBot.InlineKeyboardButton[][] = addedPaymentMethods.map(
      (pm) => [
        {
          text: `${user.t(
            `payment-methods.short-names.${pm.paymentMethod}`
          )}-${pm.fields[
            PaymentMethodPrimaryFieldIndex[pm.paymentMethod]
          ].substring(0, 4)}***`,
          callback_data: stringifyCallbackQuery<
            PaymentMethodStateKey.cb_editPaymentMethodId,
            PaymentMethodState[PaymentMethodStateKey.cb_editPaymentMethodId]
          >(PaymentMethodStateKey.cb_editPaymentMethodId, {
            paymentMethodId: pm.id,
            data: null
          })
        }
      ]
    )
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.show-edit`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  },

  async selectPaymentMethodInput() {
    const keyboard: TelegramBot.KeyboardButton[][] = Object.values(
      PaymentMethodType
    ).map((pm) => [{ text: user.t(`payment-methods.names.${pm}`) }])
    keyboard.push([{ text: user.t('actions.cancel-keyboard-button') }])
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.select-to-add`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard,
          one_time_keyboard: true
        }
      }
    )
  },

  async inputPaymentMethodField(
    paymentMethod: PaymentMethodType,
    fields: string[]
  ) {
    const fieldName = user.t(
      `payment-methods.fields.${paymentMethod}.field${fields.length + 1}`
    )
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.edit-enter-field`, {
        fieldName
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.t('actions.cancel-keyboard-button') }]],
          resize_keyboard: true
        }
      }
    )
  },

  async showPMCreateSuccess(
    paymentMethod: PaymentMethodType,
    fields: string[]
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.created`, {
        paymentMethodInfo: stringifyPaymentMethodsFields(
          [
            {
              paymentMethod,
              fields
            }
          ],
          user
        )
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async showPMEditSuccess(paymentMethod: PaymentMethodType, fields: string[]) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:payment-method.updated`, {
        paymentMethodInfo: stringifyPaymentMethodsFields(
          [
            {
              paymentMethod,
              fields
            }
          ],
          user
        )
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  }
})

const stringifyPaymentMethodsFields = (
  paymentMethods: Omit<PaymentMethodFields, 'id'>[],
  user: User
) => {
  if (paymentMethods.length === 0) {
    return user.t(`${Namespace.Account}:payment-method.none-added`)
  }

  let pmStringified = ''
  paymentMethods.forEach((pm) => {
    pmStringified =
      pmStringified +
      `*${user.t(`payment-methods.names.${pm.paymentMethod}`)}*:`

    pm.fields.forEach((field, index) => {
      pmStringified =
        pmStringified +
        `\n${user.t(
          `payment-methods.fields.${pm.paymentMethod}.field${index + 1}`
        )}: ${field}`
    })

    pmStringified = pmStringified + '\n\n'
  })
  return pmStringified
}
