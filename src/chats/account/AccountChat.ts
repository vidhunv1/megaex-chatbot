import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import { ACCOUNT_STATE_LABEL, AccountState, initialState } from './AccountState'
import { parseCallbackQuery } from 'chats/utils'
import * as _ from 'lodash'
import { ReferralStateKey, ReferralParser, ReferralResponder } from './referral'
import { SettingsStateKey, SettingsParser, SettingsResponder } from './settings'
import {
  PaymentMethodStateKey,
  PaymentMethodParser,
  PaymentMethodResponder
} from './paymentMethods'
import {
  AccountHomeStateKey,
  AccountHomeParser,
  AccountHomeResponder
} from './home'

export const AccountChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
    _command: BotCommand,
    _user: User,
    _tUser: TelegramAccount
  ) {
    return false
  },

  async handleCallback(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery,
    state: AccountState | null
  ) {
    if (callback.data) {
      const { type, params } = parseCallbackQuery(callback.data)

      const callbackName = type as any
      if (_.get(state, 'key', null) != ACCOUNT_STATE_LABEL) {
        // Callback types allowed to answer indirectly
        if (
          [
            PaymentMethodStateKey.cb_paymentMethods,
            ReferralStateKey.cb_referralLink,
            PaymentMethodStateKey.cb_editPaymentMethods,
            PaymentMethodStateKey.cb_addPaymentMethod,
            SettingsStateKey.cb_settings,
            SettingsStateKey.cb_settingsLanguage,
            SettingsStateKey.cb_settingsCurrency,
            SettingsStateKey.cb_settingsRate,
            SettingsStateKey.cb_settingsUsername
          ].includes(callbackName)
        ) {
          state = _.clone(initialState)
        } else {
          return false
        }
      }

      if (!state) {
        return false
      }

      state.currentStateKey = callbackName
      // @ts-ignore
      state[callbackName] = params

      return await processMessage(msg, user, tUser, state)
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: AccountState | null
  ) {
    let currentState = state
    if (msg.text === user.t('main-menu.account')) {
      currentState = initialState
    }

    if (currentState && currentState.key === ACCOUNT_STATE_LABEL) {
      return await processMessage(msg, user, tUser, currentState)
    } else {
      return false
    }
  }
}

const accountHomeStateKeys = Object.keys(AccountHomeStateKey)
const paymentMethodStateKeys = Object.keys(PaymentMethodStateKey)
const referralStateKeys = Object.keys(ReferralStateKey)
const settingsStateKeys = Object.keys(SettingsStateKey)

async function processMessage(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  state: AccountState
) {
  let nextState = null

  // Input parse
  if (accountHomeStateKeys.includes(state.currentStateKey))
    nextState = await AccountHomeParser(msg, user, tUser, state)
  if (paymentMethodStateKeys.includes(state.currentStateKey))
    nextState = await PaymentMethodParser(msg, user, tUser, state)
  if (referralStateKeys.includes(state.currentStateKey))
    nextState = await ReferralParser(msg, user, tUser, state)
  if (settingsStateKeys.includes(state.currentStateKey))
    nextState = await SettingsParser(msg, user, tUser, state)

  if (nextState === null) {
    return false
  }

  // Response
  if (accountHomeStateKeys.includes(nextState.currentStateKey)) {
    return await AccountHomeResponder(msg, user, nextState)
  }
  if (paymentMethodStateKeys.includes(nextState.currentStateKey)) {
    return await PaymentMethodResponder(msg, user, nextState)
  }
  if (referralStateKeys.includes(nextState.currentStateKey)) {
    return await ReferralResponder(msg, user, nextState)
  }
  if (settingsStateKeys.includes(nextState.currentStateKey)) {
    return await SettingsResponder(msg, user, nextState)
  }

  return false
}
