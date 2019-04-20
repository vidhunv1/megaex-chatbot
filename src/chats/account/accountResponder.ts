import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import {
  AccountState,
  AccountStateKey,
  PaymentMethodFields,
  AccountError
} from './AccountState'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CryptoCurrency } from 'constants/currencies'
import { stringifyCallbackQuery } from 'chats/utils'
import { VERIFY_ACCOUNT_PATH } from 'constants/paths'
import * as _ from 'lodash'
import {
  PaymentMethods,
  PaymentMethodsFieldsLocale
} from 'constants/paymentMethods'
import logger from 'modules/Logger'
import { keyboardMainMenu } from 'chats/common'
import { CONFIG } from '../../config'

const stringifyPaymentMethods = (
  paymentMethods: PaymentMethods[],
  user: User
) => {
  if (paymentMethods.length === 0) {
    return user.t(`${Namespace.Account}:account-no-payment-method`)
  }
  let pmStringified = '\n'
  paymentMethods.forEach((pm, index) => {
    pmStringified = pmStringified + user.t(`payment-methods.names.${pm}`)

    if (index < paymentMethods.length - 1) {
      pmStringified = pmStringified + ', '
    } else {
      pmStringified = pmStringified + ' '
    }
  })
  return pmStringified
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

export async function accountResponder(
  msg: TelegramBot.Message,
  user: User,
  currentState: AccountState
): Promise<boolean> {
  switch (currentState.currentStateKey) {
    case AccountStateKey.account: {
      const data = _.get(currentState[AccountStateKey.start], 'data', null)
      if (!data) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:account-home`, {
          accountID: data.accountId,
          dealCount: data.totalDeals,
          tradeVolume: data.totalVolume,
          cryptoCurrencyCode: CryptoCurrency.BTC,
          tradeSpeed: parseInt(data.avgSpeedSec / 60 + ''),
          ratingPercentage: data.rating.totalPercentage,
          upvotes: data.rating.upVotes,
          downvotes: data.rating.downVotes,
          referralCount: data.referralCount,
          earnings: data.totalEarnings,
          paymentMethods: stringifyPaymentMethods(
            data.addedPaymentMethods,
            user
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Account}:manage-payment-methods`),
                  callback_data: stringifyCallbackQuery<
                    AccountStateKey.cb_paymentMethods,
                    AccountState[AccountStateKey.cb_paymentMethods]
                  >(AccountStateKey.cb_paymentMethods, {
                    messageId: msg.message_id,
                    data: null
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Account}:verify-account`),
                  url: VERIFY_ACCOUNT_PATH
                },
                {
                  text: user.t(`${Namespace.Account}:referral-link`),
                  callback_data: stringifyCallbackQuery<
                    AccountStateKey.cb_referralLink,
                    AccountState[AccountStateKey.cb_referralLink]
                  >(AccountStateKey.cb_referralLink, {
                    messageId: msg.message_id,
                    data: null
                  })
                }
              ]
            ]
          }
        }
      )
      return true
    }

    case AccountStateKey.paymentMethods_show: {
      const data = _.get(
        currentState[AccountStateKey.cb_paymentMethods],
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
            text: user.t(`${Namespace.Account}:edit-payment-method`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_editPaymentMethods,
              AccountState[AccountStateKey.cb_paymentMethods]
            >(AccountStateKey.cb_editPaymentMethods, {
              messageId: msg.message_id,
              data: null
            })
          }
        ])
      inline.push([
        {
          text: user.t(`${Namespace.Account}:add-payment-method`),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_addPaymentMethod,
            AccountState[AccountStateKey.cb_addPaymentMethod]
          >(AccountStateKey.cb_addPaymentMethod, {
            messageId: msg.message_id,
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
    }

    case AccountStateKey.editPaymentMethod_show: {
      const data = _.get(
        currentState[AccountStateKey.cb_editPaymentMethods],
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
              AccountStateKey.cb_editPaymentMethodId,
              AccountState[AccountStateKey.cb_editPaymentMethodId]
            >(AccountStateKey.cb_editPaymentMethodId, {
              messageId: msg.message_id,
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
    }

    case AccountStateKey.paymentMethodInput: {
      const data = _.get(
        currentState[AccountStateKey.paymentMethodInput],
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
    }

    case AccountStateKey.paymentMethodCreated: {
      const data = _.get(
        currentState[AccountStateKey.paymentMethodInput],
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
    }

    case AccountStateKey.referralLink_show:
      const data = _.get(
        currentState[AccountStateKey.cb_referralLink],
        'data',
        null
      )
      if (!data) {
        return false
      }

      const { referralCount, referralLink, referralFeesPercentage } = data
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:referral-info`, {
          referralCount,
          referralFeesPercentage
        }),
        {
          parse_mode: 'Markdown'
        }
      )
      await telegramHook.getWebhook.sendMessage(msg.chat.id, referralLink, {
        disable_web_page_preview: true
      })
      return true

    case AccountStateKey.paymentMethod_error: {
      const errorType: AccountError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )

      if (!errorType) {
        return false
      }

      switch (errorType) {
        case AccountError.INVALID_PAYMENT_METHOD:
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

        case AccountError.ERROR_CREATING_PAYMENT_METHOD:
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
    }

    default:
      return false
  }
}
