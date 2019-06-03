import { SettingsStateKey, SettingsError } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'
import { FiatCurrency } from 'constants/currencies'
import { User } from 'models'
import { TelegramAccount } from 'models'
import { Account } from 'lib/Account'
import { ExchangeSource } from 'constants/exchangeSource'
import { Language } from 'constants/languages'
import { logger } from 'modules'

export const SettingsParser: Parser<AccountState> = async (
  msg,
  user,
  tUser,
  currentState
) => {
  const parser: Record<SettingsStateKey, () => Promise<AccountState | null>> = {
    [SettingsStateKey.cb_settings]: async () => {
      return currentState
    },

    [SettingsStateKey.cb_settingsCurrency]: async () => {
      return {
        ...currentState,
        [SettingsStateKey.settingsCurrency_show]: {
          data: {
            cursor: 0
          }
        }
      }
    },

    [SettingsStateKey.cb_settingsLanguage]: async () => {
      return currentState
    },

    [SettingsStateKey.cb_settingsRate]: async () => {
      return currentState
    },

    [SettingsStateKey.cb_settingsUsername]: async () => {
      return currentState
    },

    [SettingsStateKey.cb_loadMore]: async () => {
      const cursor = _.get(
        currentState[SettingsStateKey.cb_loadMore],
        'cursor',
        null
      )

      return {
        ...currentState,
        [SettingsStateKey.settingsCurrency_show]: {
          data: {
            cursor: cursor || 0
          }
        }
      }
    },

    [SettingsStateKey.settingsCurrency_show]: async () => {
      return currentState
    },

    [SettingsStateKey.settingsUsername_show]: async () => {
      const username = msg.text

      const errorResp: AccountState = {
        ...currentState,
        [SettingsStateKey.settingsUsername_show]: {
          username: username || '',
          data: null,
          error: SettingsError.INVALID_USERNAME
        }
      }

      if (username == null) {
        return errorResp
      }

      const isSuccess = updateusername(username || '')

      if (!isSuccess) {
        return errorResp
      }

      return {
        ...currentState,
        [SettingsStateKey.settingsUsername_show]: {
          username: username || '',
          data: null,
          error: null
        }
      }
    },

    [SettingsStateKey.settings_show]: async () => {
      return null
    },

    [SettingsStateKey.cb_settingsCurrency_update]: async () => {
      const currencyCode = _.get(
        currentState[SettingsStateKey.cb_settingsCurrency_update],
        'currency',
        null
      )
      if (currencyCode == null) {
        return null
      }

      await updateCurrency(currencyCode, user, tUser)
      return currentState
    },

    [SettingsStateKey.cb_settingsLanguage_update]: async () => {
      const language = _.get(
        currentState[SettingsStateKey.cb_settingsLanguage_update],
        'lang',
        null
      )
      if (language == null) {
        return null
      }

      await updateLanguage(language, user, tUser)
      return currentState
    },

    [SettingsStateKey.cb_settingsRate_update]: async () => {
      const rateSource = _.get(
        currentState[SettingsStateKey.cb_settingsRate_update],
        'rateSource'
      )
      if (rateSource == null) {
        return null
      }

      await updateRateSource(rateSource, user, tUser)
      return currentState
    },

    [SettingsStateKey.settingsError]: async () => {
      return currentState
    },

    [SettingsStateKey.settingsLanguage_show]: async () => {
      return null
    },

    [SettingsStateKey.settingsRate_show]: async () => {
      return null
    },

    [SettingsStateKey.settingsUpdateResult]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    currentState.currentStateKey as SettingsStateKey
  ]()
  const nextStateKey = nextSettingsState(updatedState)
  const nextState = updateNextAccountState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextSettingsState(
  state: AccountState | null
): AccountStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case SettingsStateKey.cb_settings:
      return SettingsStateKey.settings_show
    case SettingsStateKey.settings_show:
      return null

    case SettingsStateKey.cb_settingsLanguage:
      return SettingsStateKey.settingsLanguage_show

    case SettingsStateKey.cb_settingsCurrency:
      return SettingsStateKey.settingsCurrency_show

    case SettingsStateKey.cb_settingsRate:
      return SettingsStateKey.settingsRate_show

    case SettingsStateKey.cb_settingsUsername:
      return SettingsStateKey.settingsUsername_show

    case SettingsStateKey.settingsUsername_show: {
      const isError = _.get(
        state[SettingsStateKey.settingsUsername_show],
        'error',
        null
      )

      if (isError === SettingsError.INVALID_USERNAME) {
        return SettingsStateKey.settingsError
      }
      return SettingsStateKey.settingsUpdateResult
    }

    case SettingsStateKey.cb_loadMore: {
      return SettingsStateKey.settingsCurrency_show
    }

    case SettingsStateKey.cb_settingsCurrency_update: {
      return SettingsStateKey.settingsCurrency_show
    }

    case SettingsStateKey.cb_settingsRate_update: {
      return SettingsStateKey.settingsRate_show
    }
    case SettingsStateKey.cb_settingsLanguage_update: {
      return SettingsStateKey.settingsLanguage_show
    }

    default:
      return null
  }
}

const updateCurrency = async (
  currencyCode: FiatCurrency,
  user: User,
  tUser: TelegramAccount
) => {
  await User.update(
    {
      currencyCode: currencyCode
    },
    { where: { id: user.id } }
  )
  await Account.clearUserCache(tUser.id)
  return true
}
const updateRateSource = async (
  source: ExchangeSource,
  user: User,
  tUser: TelegramAccount
) => {
  await User.update(
    {
      exchangeRateSource: source
    },
    { where: { id: user.id } }
  )
  await Account.clearUserCache(tUser.id)

  return true
}

const updateLanguage = async (
  language: Language,
  user: User,
  tUser: TelegramAccount
) => {
  await User.update(
    {
      locale: language
    },
    { where: { id: user.id } }
  )
  await Account.clearUserCache(tUser.id)

  return true
}

const updateusername = (username: string) => {
  logger.error('TODO: settings/parser Update username ' + username)
  return false
}
