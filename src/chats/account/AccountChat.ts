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
  AccountHomeResponder,
  AccountHomeMessage,
  AccountHomeError
} from './home'
import { CryptoCurrency } from 'constants/currencies'
import logger from 'modules/logger'

export const AccountChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    command: BotCommand,
    user: User,
    _tUser: TelegramAccount
  ) {
    if (command === BotCommand.ACCOUNT && msg.text) {
      const accountId = msg.text.replace(BotCommand.ACCOUNT, '')
      const accountInfo = await getAccount(accountId)
      if (accountInfo != null) {
        await AccountHomeMessage(msg, user).showDealerAccount(
          accountInfo.accountId,
          accountInfo.telegramUsername,
          accountInfo.dealCount,
          accountInfo.tradeVolume,
          accountInfo.cryptoCurrencyCode,
          accountInfo.tradeSpeed,
          accountInfo.rating,
          accountInfo.reviewCount
          // accountInfo.isUserBlocked
        )
      } else {
        await AccountHomeMessage(msg, user).showError(
          AccountHomeError.ACCOUNT_NOT_FOUND
        )
      }
      return true
    }

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
            SettingsStateKey.cb_settings,
            SettingsStateKey.cb_settingsLanguage,
            SettingsStateKey.cb_settingsCurrency,
            SettingsStateKey.cb_settingsRate,
            SettingsStateKey.cb_settingsUsername,
            AccountHomeStateKey.cb_showReviews,
            AccountHomeStateKey.cb_reviewShowMore
          ].includes(callbackName)
        ) {
          state = {
            ..._.clone(initialState),
            ...state
          }
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

async function getAccount(
  accountId: string
): Promise<{
  accountId: string
  telegramUsername: string
  dealCount: number
  tradeVolume: number
  cryptoCurrencyCode: CryptoCurrency
  tradeSpeed: number
  reviewCount: number
  // isUserBlocked: boolean,
  rating: number
} | null> {
  logger.error('TODO: Accountchat getAccount')
  return {
    accountId,
    telegramUsername: 'satoshi',
    dealCount: 4,
    tradeVolume: 100,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    tradeSpeed: 100,
    reviewCount: 30,
    // isUserBlocked: false,
    rating: 4.5
  }
}
