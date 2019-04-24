import { CallbackDefaults } from 'chats/types'
import { ExchangeSource } from 'constants/exchangeSource'
import { Language } from 'constants/languages'
import { FiatCurrency } from 'constants/currencies'

export enum SettingsStateKey {
  cb_settings = 'cb_settings',
  settings_show = 'settings_show',

  cb_settingsCurrency = 'cb_settingsCurrency',
  settingsCurrency_show = 'settingsCurrency_show',

  cb_settingsLanguage = 'cb_settingsLanguage',
  settingsLanguage_show = 'settingsLanguage_show',
  cb_settingsRate = 'cb_settingsRate',
  settingsRate_show = 'settingsRate_show',
  cb_settingsUsername = 'cb_settingsUsername',
  settingsUsername_show = 'settingsUsername_show',

  cb_loadMore = 'cb_loadMore',

  cb_settingsCurrency_update = 'cb_settingsCurrency_update',
  cb_settingsLanguage_update = 'cb_settingsLanguage_update',
  cb_settingsRate_update = 'cb_settingsRate_update',
  settingsUpdateResult = 'cb_settingsUpdateResult',

  settingsError = 'settingsError'
}

export enum SettingsError {
  INVALID_USERNAME = 'INVALID_USERNAME'
}

export interface SettingsState {
  [SettingsStateKey.cb_settings]?: {
    isFromBack: boolean
    data: {} | null
  } & CallbackDefaults

  [SettingsStateKey.cb_settingsCurrency]?: {
    data: {} | null
  } & CallbackDefaults
  [SettingsStateKey.settingsCurrency_show]?: {
    data: {
      cursor: number
    } | null
  }
  [SettingsStateKey.cb_loadMore]?: {
    cursor: number
  } & CallbackDefaults
  [SettingsStateKey.cb_settingsLanguage]?: {
    data: {} | null
  } & CallbackDefaults
  [SettingsStateKey.cb_settingsRate]?: {
    data: {} | null
  } & CallbackDefaults
  [SettingsStateKey.cb_settingsUsername]?: {
    data: {} | null
  } & CallbackDefaults

  [SettingsStateKey.cb_settingsCurrency_update]?: {
    currency: FiatCurrency
    data: {} | null
  }
  [SettingsStateKey.cb_settingsLanguage_update]?: {
    lang: Language
    data: {} | null
  }
  [SettingsStateKey.cb_settingsRate_update]?: {
    rateSource: ExchangeSource
    data: {} | null
  }
  [SettingsStateKey.settingsUsername_show]?: {
    username: string
    data: {} | null
    error: SettingsError.INVALID_USERNAME | null
  }
}
