import { SettingsStateKey, SettingsError } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { TelegramAccount, User } from 'models'
import { logger } from 'modules'
import { SettingsMessage } from './messages'

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
          await SettingsMessage(msg, user).errorInvalidUsername()
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

      await SettingsMessage(msg, user).settingsUpdateSuccess(updatedUser.user)
      return true
    },

    [SettingsStateKey.settingsUsername_show]: async () => {
      await SettingsMessage(msg, user).showUsernameInput()
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

      await SettingsMessage(msg, user).editAndShowExchangeRateSource(
        updatedUser.user
      )

      if (updatedUser.user.exchangeRateSource !== user.exchangeRateSource) {
        await SettingsMessage(msg, user).settingsUpdateSuccess(updatedUser.user)
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

      await SettingsMessage(msg, user).editOrSendSettings(isFromBack)
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

      await SettingsMessage(msg, user).editAndShowCurrency(
        updatedUser.user,
        cursor
      )

      if (updatedUser.user.currencyCode !== user.currencyCode) {
        await SettingsMessage(msg, user).settingsUpdateSuccess(updatedUser.user)
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

      await SettingsMessage(msg, user).editAndShowLanguage(updatedUser.user)

      if (updatedUser.user.locale !== user.locale) {
        await SettingsMessage(msg, user).settingsUpdateSuccess(updatedUser.user)
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
