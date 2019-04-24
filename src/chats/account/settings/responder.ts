import telegramHook from 'modules/TelegramHook'
import { SettingsStateKey, SettingsState, SettingsError } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { Namespace } from 'modules/i18n'
import { TelegramAccount, User } from 'models'
import { keyboardMainMenu } from 'chats/common'
import { ExchangeSource } from 'constants/exchangeSource'
import { stringifyCallbackQuery } from 'chats/utils'
import * as TelegramBot from 'node-telegram-bot-api'
import { FiatCurrency } from 'constants/currencies'
import { getCurrencyView } from 'chats/signup/utils'
import { Language, LanguageView } from 'constants/languages'
import logger from 'modules/Logger'

export const SettingsResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<SettingsStateKey, () => Promise<boolean>> = {
    [SettingsStateKey.settingsError]: async () => {
      const errorType: SettingsError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )

      if (!errorType) {
        return false
      }

      switch (errorType) {
        case SettingsError.INVALID_USERNAME: {
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

      logger.error('Unhandled error type in SettingsResponder ' + errorType)
      return false
    },
    [SettingsStateKey.settingsUpdateResult]: async () => {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findOne(
        {
          include: [{ model: User }],
          where: {
            userId: user.id
          }
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
    },

    [SettingsStateKey.settingsUsername_show]: async () => {
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
    },

    [SettingsStateKey.settingsRate_show]: async () => {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findOne(
        {
          include: [{ model: User }],
          where: {
            userId: user.id
          }
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
          SettingsStateKey.cb_settingsRate_update,
          SettingsState[SettingsStateKey.cb_settingsRate_update]
        >(SettingsStateKey.cb_settingsRate_update, {
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
            SettingsStateKey.cb_settings,
            SettingsState[SettingsStateKey.cb_settings]
          >(SettingsStateKey.cb_settings, {
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
          chat_id: msg.chat.id,
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
    },

    [SettingsStateKey.settings_show]: async () => {
      const isFromBack =
        // @ts-ignore
        _.get(
          currentState[SettingsStateKey.cb_settings],
          'isFromBack',
          null
        ) === 'true'

      if (isFromBack === null) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = [
        [
          {
            text: user.t(`${Namespace.Account}:settings-currency-cbbutton`),
            callback_data: stringifyCallbackQuery<
              SettingsStateKey.cb_settingsCurrency,
              SettingsState[SettingsStateKey.cb_settingsCurrency]
            >(SettingsStateKey.cb_settingsCurrency, {
              mId: msg.message_id,
              data: null
            })
          },
          {
            text: user.t(`${Namespace.Account}:settings-language-cbbutton`),
            callback_data: stringifyCallbackQuery<
              SettingsStateKey.cb_settingsLanguage,
              SettingsState[SettingsStateKey.cb_settingsLanguage]
            >(SettingsStateKey.cb_settingsLanguage, {
              mId: msg.message_id,
              data: null
            })
          }
        ],
        [
          {
            text: user.t(`${Namespace.Account}:settings-rate-source-cbbutton`),
            callback_data: stringifyCallbackQuery<
              SettingsStateKey.cb_settingsRate,
              SettingsState[SettingsStateKey.cb_settingsRate]
            >(SettingsStateKey.cb_settingsRate, {
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
          chat_id: msg.chat.id,
          message_id: msg.message_id
        })
      } else {
        await telegramHook.getWebhook.sendMessage(msg.chat.id, sendMessage, {
          ...opts
        })
      }
      return true
    },

    [SettingsStateKey.settingsCurrency_show]: async () => {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findOne(
        {
          include: [{ model: User }],
          where: {
            userId: user.id
          }
        }
      )
      if (!updatedUser) {
        return false
      }

      const cbData = _.get(
        currentState[SettingsStateKey.settingsCurrency_show],
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
          SettingsStateKey.cb_settingsCurrency_update,
          SettingsState[SettingsStateKey.cb_settingsCurrency_update]
        >(SettingsStateKey.cb_settingsCurrency_update, {
          currency: fiatCurrency as FiatCurrency,
          data: null
        })
      }))

      const inline: TelegramBot.InlineKeyboardButton[][] = _.chunk(list, 3)
      inline.push([
        {
          text: user.t(`${Namespace.Account}:back-to-settings-cbbutton`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_settings,
            SettingsState[SettingsStateKey.cb_settings]
          >(SettingsStateKey.cb_settings, {
            mId: msg.message_id,
            isFromBack: true,
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:show-more`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_loadMore,
            SettingsState[SettingsStateKey.cb_loadMore]
          >(SettingsStateKey.cb_loadMore, {
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
          chat_id: msg.chat.id,
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
    },

    [SettingsStateKey.settingsLanguage_show]: async () => {
      const updatedUser: TelegramAccount | null = await TelegramAccount.findOne(
        {
          include: [{ model: User }],
          where: {
            userId: user.id
          }
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
          SettingsStateKey.cb_settingsLanguage_update,
          AccountState[SettingsStateKey.cb_settingsLanguage_update]
        >(SettingsStateKey.cb_settingsLanguage_update, {
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
            SettingsStateKey.cb_settings,
            AccountState[SettingsStateKey.cb_settings]
          >(SettingsStateKey.cb_settings, {
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
          chat_id: msg.chat.id,
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
    },

    [SettingsStateKey.cb_settings]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsCurrency]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsLanguage]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsRate]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsUsername]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsCurrency_update]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsLanguage_update]: async () => {
      return false
    },

    [SettingsStateKey.cb_settingsRate_update]: async () => {
      return false
    },

    [SettingsStateKey.cb_loadMore]: async () => {
      return false
    }
  }

  return resp[currentState.currentStateKey as SettingsStateKey]()
}
