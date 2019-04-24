import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { keyboardMainMenu } from 'chats/common'
import { Namespace } from 'modules/i18n'
import { ExchangeSource } from 'constants/exchangeSource'
import { stringifyCallbackQuery } from 'chats/utils'
import { SettingsStateKey, SettingsState } from './types'
import * as _ from 'lodash'
import { FiatCurrency } from 'constants/currencies'
import { getCurrencyView } from 'chats/signup/utils'
import { Language, LanguageView } from 'constants/languages'

export const SettingsMessage = (msg: TelegramBot.Message, user: User) => ({
  async errorInvalidUsername() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:settings.invalid-username`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async settingsUpdateSuccess(updatedUser: User) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:settings.update-success`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(updatedUser)
      }
    )
  },

  async showUsernameInput() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:settings.username-show`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.t('actions.cancel-keyboard-button') }]]
        }
      }
    )
  },

  async editAndShowExchangeRateSource(updatedUser: User) {
    const sourcesList = Object.keys(ExchangeSource).map((source) => ({
      text:
        (source === updatedUser.exchangeRateSource ? '☑️  ' : '') +
        user.t(`exchange-source.${source}`),
      callback_data: stringifyCallbackQuery<
        SettingsStateKey.cb_settingsRate_update,
        SettingsState[SettingsStateKey.cb_settingsRate_update]
      >(SettingsStateKey.cb_settingsRate_update, {
        rateSource: source as ExchangeSource,
        data: null
      })
    }))

    const inline: TelegramBot.InlineKeyboardButton[][] = _.chunk(sourcesList, 2)

    inline.push([
      {
        text: updatedUser.t(
          `${Namespace.Account}:settings.back-to-settings-cbbutton`
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
      updatedUser.t(`${Namespace.Account}:settings.show-rate-source`, {
        exchangeSource: user.t(
          `exchange-source.${updatedUser.exchangeRateSource}`
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
  },

  async editAndShowCurrency(updatedUser: User, cursor: number) {
    const ITEMS_PER_PAGE = 15
    const currentCurrencyCode = updatedUser.currencyCode

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
        text: user.t(`${Namespace.Account}:settings.back-to-settings-cbbutton`),
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
        text: user.t(`${Namespace.Account}:settings.show-more`),
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
      user.t(`${Namespace.Account}:settings.show-currency`, {
        fiatCurrencyCode: updatedUser.currencyCode
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
  },

  async editAndShowLanguage(updatedUser: User) {
    const languageList = Object.keys(Language).map((lang) => ({
      text:
        (lang === updatedUser.locale ? '☑️  ' : '     ') +
        LanguageView[lang as Language],
      callback_data: stringifyCallbackQuery<
        SettingsStateKey.cb_settingsLanguage_update,
        SettingsState[SettingsStateKey.cb_settingsLanguage_update]
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
        text: updatedUser.t(
          `${Namespace.Account}:settings.back-to-settings-cbbutton`
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
      updatedUser.t(`${Namespace.Account}:settings.show-language`, {
        language:
          updatedUser.locale.charAt(0).toUpperCase() +
          updatedUser.locale.slice(1).toLowerCase()
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
  },

  async editOrSendSettings(shouldEdit: boolean) {
    const inline: TelegramBot.InlineKeyboardButton[][] = [
      [
        {
          text: user.t(`${Namespace.Account}:settings.currency-cbbutton`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_settingsCurrency,
            SettingsState[SettingsStateKey.cb_settingsCurrency]
          >(SettingsStateKey.cb_settingsCurrency, {
            mId: msg.message_id,
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:settings.language-cbbutton`),
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
          text: user.t(`${Namespace.Account}:settings.rate-source-cbbutton`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_settingsRate,
            SettingsState[SettingsStateKey.cb_settingsRate]
          >(SettingsStateKey.cb_settingsRate, {
            mId: msg.message_id,
            data: null
          })
        }
        // {
        //   text: user.t(`${Namespace.Account}:settings.username-cbbutton`),
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
    const sendMessage = user.t(`${Namespace.Account}:settings.show-settings`)
    const opts = {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: inline
      }
    }

    if (shouldEdit) {
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
  }
})
