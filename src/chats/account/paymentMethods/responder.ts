import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import {
  PaymentMethodStateKey,
  PaymentMethodState,
  PaymentMethodFields,
  PaymentMethodError
} from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { User } from 'models'
import {
  PaymentMethods,
  PaymentMethodsFieldsLocale
} from 'constants/paymentMethods'
import { keyboardMainMenu } from 'chats/common'
import logger from 'modules/Logger'
import { CONFIG } from '../../../config'

export const PaymentMethodResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<PaymentMethodStateKey, () => Promise<boolean>> = {
    [PaymentMethodStateKey.paymentMethodError]: async () => {
      const errorType: PaymentMethodError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )

      if (!errorType) {
        return false
      }

      switch (errorType) {
        case PaymentMethodError.INVALID_PAYMENT_METHOD:
          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(`${Namespace.Account}:payment-method-does-not-exist`, {
              supportBotUsername: CONFIG.SUPPORT_USERNAME
            }),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true

        case PaymentMethodError.ERROR_CREATING_PAYMENT_METHOD:
          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(`${Namespace.Account}:payment-method-create-error`),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
      }

      logger.error('Unhandled error type in AccountResponder ' + errorType)
      return false
    },

    [PaymentMethodStateKey.paymentMethods_show]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.cb_paymentMethods],
        'data',
        null
      )
      if (!data) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = []
      data.addedPaymentMethods.length > 0 &&
        inline.push([
          {
            text: user.t(`${Namespace.Account}:edit-payment-method-cbbutton`),
            callback_data: stringifyCallbackQuery<
              PaymentMethodStateKey.cb_editPaymentMethods,
              PaymentMethodState[PaymentMethodStateKey.cb_paymentMethods]
            >(PaymentMethodStateKey.cb_editPaymentMethods, {
              mId: msg.message_id,
              data: null
            })
          }
        ])
      inline.push([
        {
          text: user.t(`${Namespace.Account}:add-payment-method-cbbutton`),
          callback_data: stringifyCallbackQuery<
            PaymentMethodStateKey.cb_addPaymentMethod,
            AccountState[PaymentMethodStateKey.cb_addPaymentMethod]
          >(PaymentMethodStateKey.cb_addPaymentMethod, {
            mId: msg.message_id,
            data: null
          })
        }
      ])

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:payment-methods-show`, {
          paymentMethodsList: stringifyPaymentMethodsFields(
            data.addedPaymentMethods,
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
      return true
    },

    [PaymentMethodStateKey.editPaymentMethod_show]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.cb_editPaymentMethods],
        'data',
        null
      )
      if (!data) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = data.addedPaymentMethods.map(
        (pm) => [
          {
            text: user.t(`payment-methods.names.${pm.paymentMethod}`),
            callback_data: stringifyCallbackQuery<
              PaymentMethodStateKey.cb_editPaymentMethodId,
              AccountState[PaymentMethodStateKey.cb_editPaymentMethodId]
            >(PaymentMethodStateKey.cb_editPaymentMethodId, {
              mId: msg.message_id,
              paymentMethodId: pm.id,
              data: null
            })
          }
        ]
      )
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:edit-payment-method-show`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: inline
          }
        }
      )
      return true
    },

    [PaymentMethodStateKey.paymentMethodInput]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.paymentMethodInput],
        'data',
        null
      )
      if (!data || (data && !data.inputs.paymentMethod)) {
        const keyboard: TelegramBot.KeyboardButton[][] = Object.values(
          PaymentMethods
        ).map((pm) => [{ text: user.t(`payment-methods.names.${pm}`) }])
        keyboard.push([{ text: user.t('actions.cancel-keyboard-button') }])
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:add-payment-method-select`),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard,
              one_time_keyboard: true
            }
          }
        )

        return true
      }

      const { inputs } = data
      if (
        inputs.fields.length <
        PaymentMethodsFieldsLocale[inputs.paymentMethod].length
      ) {
        const fieldName = user.t(
          `payment-methods.fields.${inputs.paymentMethod}.field${inputs.fields
            .length + 1}`
        )
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:edit-payment-method-enter-field`, {
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
        return true
      } else {
        logger.error(
          `Invalid state: all fields exists accountResponder#${
            currentState.currentStateKey
          }`
        )
        return false
      }
    },

    [PaymentMethodStateKey.paymentMethodCreated]: async () => {
      const data = _.get(
        currentState[PaymentMethodStateKey.paymentMethodInput],
        'data',
        null
      )
      if (!data || !data.inputs) {
        return false
      }

      if (data.inputs.editId) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:payment-method-updated`, {
            paymentMethodInfo: stringifyPaymentMethodsFields(
              [data.inputs],
              user
            )
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
      } else {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:payment-method-created`, {
            paymentMethodInfo: stringifyPaymentMethodsFields(
              [data.inputs],
              user
            )
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
      }
      return true
    },

    [PaymentMethodStateKey.cb_paymentMethods]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_editPaymentMethods]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_editPaymentMethodId]: async () => {
      return false
    },
    [PaymentMethodStateKey.cb_addPaymentMethod]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as PaymentMethodStateKey]()
}

const stringifyPaymentMethodsFields = (
  paymentMethods: Omit<PaymentMethodFields, 'id'>[],
  user: User
) => {
  if (paymentMethods.length === 0) {
    return user.t(`${Namespace.Account}:payment-method-none`)
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
