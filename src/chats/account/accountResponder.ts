import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import {
  AccountState,
  AccountStateKey,
  PaymentMethodFields,
  AccountError
} from './AccountState'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
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
import { getCurrencyView } from 'chats/signup/utils'
import { Language, LanguageView } from 'constants/languages'
import { ExchangeSource } from 'constants/exchangeSource'

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
  tUser: TelegramAccount,
  currentState: AccountState
): Promise<boolean> {
  switch (currentState.currentStateKey) {
    case AccountStateKey.account: {
      const data = _.get(currentState[AccountStateKey.start], 'data', null)
      if (!data) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = [
        [
          {
            text: user.t(
              `${Namespace.Account}:manage-payment-methods-cbbutton`
            ),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_paymentMethods,
              AccountState[AccountStateKey.cb_paymentMethods]
            >(AccountStateKey.cb_paymentMethods, {
              mId: msg.message_id,
              data: null
            })
          }
        ],
        [
          {
            text: user.t(`${Namespace.Account}:referral-link-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_referralLink,
              AccountState[AccountStateKey.cb_referralLink]
            >(AccountStateKey.cb_referralLink, {
              mId: msg.message_id,
              data: null
            })
          },
          {
            text: user.t(`${Namespace.Account}:settings-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_settings,
              AccountState[AccountStateKey.cb_settings]
            >(AccountStateKey.cb_settings, {
              mId: msg.message_id,
              isFromBack: false,
              data: null
            })
          }
        ]
      ]

      !user.isVerified &&
        inline[0].push({
          text: user.t(`${Namespace.Account}:verify-account-cbbutton`),
          url: VERIFY_ACCOUNT_PATH
        })

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
            inline_keyboard: inline
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
            text: user.t(`${Namespace.Account}:edit-payment-method-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_editPaymentMethods,
              AccountState[AccountStateKey.cb_paymentMethods]
            >(AccountStateKey.cb_editPaymentMethods, {
              mId: msg.message_id,
              data: null
            })
          }
        ])
      inline.push([
        {
          text: user.t(`${Namespace.Account}:add-payment-method-cbbutton`),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_addPaymentMethod,
            AccountState[AccountStateKey.cb_addPaymentMethod]
          >(AccountStateKey.cb_addPaymentMethod, {
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
        user.t(`${Namespace.Account}:referral-info-button`, {
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

    case AccountStateKey.settings_show: {
      const isFromBack =
        // @ts-ignore
        _.get(currentState[AccountStateKey.cb_settings], 'isFromBack', null) ===
        'true'

      if (isFromBack === null) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = [
        [
          {
            text: user.t(`${Namespace.Account}:settings-currency-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_settingsCurrency,
              AccountState[AccountStateKey.cb_settingsCurrency]
            >(AccountStateKey.cb_settingsCurrency, {
              mId: msg.message_id,
              data: null
            })
          },
          {
            text: user.t(`${Namespace.Account}:settings-language-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_settingsLanguage,
              AccountState[AccountStateKey.cb_settingsLanguage]
            >(AccountStateKey.cb_settingsLanguage, {
              mId: msg.message_id,
              data: null
            })
          }
        ],
        [
          {
            text: user.t(`${Namespace.Account}:settings-rate-source-cbbutton`),
            callback_data: stringifyCallbackQuery<
              AccountStateKey.cb_settingsRate,
              AccountState[AccountStateKey.cb_settingsRate]
            >(AccountStateKey.cb_settingsRate, {
              mId: msg.message_id,
              data: null
            })
          }
          // {
          //   text: user.t(`${Namespace.Account}:settings-username-cbbutton`),
          //   callback_data: stringifyCallbackQuery<
          //     AccountStateKey.cb_settingsUsername,
          //     AccountState[AccountStateKey.cb_settingsUsername]
          //   >(AccountStateKey.cb_settingsUsername, {
          //     mId: msg.message_id,
          //     data: null
          //   })
          // }
        ]
      ]
      const sendMessage = user.t(`${Namespace.Account}:settings-show`)
      const opts = {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }

      if (isFromBack) {
        await telegramHook.getWebhook.editMessageText(sendMessage, {
          ...opts,
          chat_id: tUser.id,
          message_id: msg.message_id
        })
      } else {
        await telegramHook.getWebhook.sendMessage(msg.chat.id, sendMessage, {
          ...opts
        })
      }
      return true
    }

    case AccountStateKey.settingsCurrency_show: {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findById(
        tUser.id,
        {
          include: [{ model: User }]
        }
      )
      if (!updatedUser) {
        return false
      }

      const cbData = _.get(
        currentState[AccountStateKey.settingsCurrency_show],
        'data',
        null
      )
      const cursor = parseInt(_.get(cbData, 'cursor', 0) + '')
      const ITEMS_PER_PAGE = 15
      const currentCurrencyCode = updatedUser.user.currencyCode

      const allFiatCurrencies = Object.keys(FiatCurrency)
      const initialList = _.take(
        _.drop(allFiatCurrencies, cursor),
        ITEMS_PER_PAGE
      )
      const finalist = [
        ...initialList,
        ..._.take(allFiatCurrencies, ITEMS_PER_PAGE - initialList.length)
      ]

      const list = finalist.map((fiatCurrency) => ({
        text:
          (currentCurrencyCode === fiatCurrency ? '☑️  ' : '') +
          getCurrencyView(fiatCurrency as FiatCurrency),
        callback_data: stringifyCallbackQuery<
          AccountStateKey.cb_settingsCurrency_update,
          AccountState[AccountStateKey.cb_settingsCurrency_update]
        >(AccountStateKey.cb_settingsCurrency_update, {
          currency: fiatCurrency as FiatCurrency,
          data: null
        })
      }))

      const inline: TelegramBot.InlineKeyboardButton[][] = _.chunk(list, 3)
      inline.push([
        {
          text: user.t(`${Namespace.Account}:back-to-settings-cbbutton`),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_settings,
            AccountState[AccountStateKey.cb_settings]
          >(AccountStateKey.cb_settings, {
            mId: msg.message_id,
            isFromBack: true,
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:show-more`),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_loadMore,
            AccountState[AccountStateKey.cb_loadMore]
          >(AccountStateKey.cb_loadMore, {
            mId: msg.message_id,
            cursor:
              initialList.length < ITEMS_PER_PAGE
                ? ITEMS_PER_PAGE - initialList.length
                : cursor + ITEMS_PER_PAGE
          })
        }
      ])

      await telegramHook.getWebhook.editMessageText(
        user.t(`${Namespace.Account}:settings-currency-show`, {
          fiatCurrencyCode: updatedUser.user.currencyCode
        }),
        {
          parse_mode: 'Markdown',
          chat_id: tUser.id,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: inline
          }
        }
      )

      if (updatedUser.user.currencyCode !== user.currencyCode) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:settings-updated`),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(updatedUser.user)
          }
        )
      }

      return true
    }

    case AccountStateKey.settingsLanguage_show:
      const updatedUser: TelegramAccount | null = await TelegramAccount.findById(
        tUser.id,
        {
          include: [{ model: User }]
        }
      )
      if (!updatedUser) {
        return false
      }

      const languageList = Object.keys(Language).map((lang) => ({
        text:
          (lang === updatedUser.user.locale ? '☑️  ' : '     ') +
          LanguageView[lang as Language],
        callback_data: stringifyCallbackQuery<
          AccountStateKey.cb_settingsLanguage_update,
          AccountState[AccountStateKey.cb_settingsLanguage_update]
        >(AccountStateKey.cb_settingsLanguage_update, {
          lang: lang as Language,
          data: null
        })
      }))

      const inline: TelegramBot.InlineKeyboardButton[][] = _.chunk(
        languageList,
        2
      )
      inline.push([
        {
          text: updatedUser.user.t(
            `${Namespace.Account}:back-to-settings-cbbutton`
          ),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_settings,
            AccountState[AccountStateKey.cb_settings]
          >(AccountStateKey.cb_settings, {
            mId: msg.message_id,
            isFromBack: true,
            data: null
          })
        }
      ])
      await telegramHook.getWebhook.editMessageText(
        updatedUser.user.t(`${Namespace.Account}:settings-language-show`, {
          language:
            updatedUser.user.locale.charAt(0).toUpperCase() +
            updatedUser.user.locale.slice(1).toLowerCase()
        }),
        {
          parse_mode: 'Markdown',
          chat_id: tUser.id,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: inline
          }
        }
      )

      if (updatedUser.user.locale !== user.locale) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:settings-updated`),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(updatedUser.user)
          }
        )
      }

      return true

    case AccountStateKey.settingsRate_show: {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findById(
        tUser.id,
        {
          include: [{ model: User }]
        }
      )
      if (!updatedUser) {
        return false
      }

      const sourcesList = Object.keys(ExchangeSource).map((source) => ({
        text:
          (source === updatedUser.user.exchangeRateSource ? '☑️  ' : '') +
          user.t(`exchange-source.${source}`),
        callback_data: stringifyCallbackQuery<
          AccountStateKey.cb_settingsRate_update,
          AccountState[AccountStateKey.cb_settingsRate_update]
        >(AccountStateKey.cb_settingsRate_update, {
          rateSource: source as ExchangeSource,
          data: null
        })
      }))

      const inline: TelegramBot.InlineKeyboardButton[][] = _.chunk(
        sourcesList,
        2
      )

      inline.push([
        {
          text: updatedUser.user.t(
            `${Namespace.Account}:back-to-settings-cbbutton`
          ),
          callback_data: stringifyCallbackQuery<
            AccountStateKey.cb_settings,
            AccountState[AccountStateKey.cb_settings]
          >(AccountStateKey.cb_settings, {
            mId: msg.message_id,
            isFromBack: true,
            data: null
          })
        }
      ])
      await telegramHook.getWebhook.editMessageText(
        updatedUser.user.t(`${Namespace.Account}:settings-rate-source-show`, {
          exchangeSource: user.t(
            `exchange-source.${updatedUser.user.exchangeRateSource}`
          )
        }),
        {
          parse_mode: 'Markdown',
          chat_id: tUser.id,
          message_id: msg.message_id,
          reply_markup: {
            inline_keyboard: inline
          }
        }
      )

      if (updatedUser.user.exchangeRateSource !== user.exchangeRateSource) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t(`${Namespace.Account}:settings-updated`),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(updatedUser.user)
          }
        )
      }

      return true
    }

    case AccountStateKey.settingsUsername_show:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:settings-username-show`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: user.t('actions.cancel-keyboard-button') }]]
          }
        }
      )
      return true

    case AccountStateKey.account_error: {
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
        case AccountError.INVALID_USERNAME: {
          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(`[TODO]: Username is invalid`),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
        }
      }

      logger.error('Unhandled error type in AccountResponder ' + errorType)
      return false
    }

    case AccountStateKey.settingsUpdateResult: {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findById(
        tUser.id,
        {
          include: [{ model: User }]
        }
      )
      if (!updatedUser) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:settings-updated`),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(updatedUser.user)
        }
      )
      return true
    }

    default:
      return false
  }
}
