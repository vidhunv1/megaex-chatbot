import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import { parseDeepLink, moveToNextState } from 'chats/utils'
import telegramHook from 'modules/TelegramHook'
import { SignupState, initialState, signupFlow } from './SignupState'
import { CacheHelper } from 'lib/CacheHelper'
import { Namespace } from 'modules/I18n'
import { get, findKey } from 'lodash'
import logger from 'modules/Logger'
import { LanguageView, Language } from 'constants/languages'
import { languageKeyboard, currencyKeyboard } from './utils'
import { FiatCurrency } from 'constants/currencies'

export const SignupChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    if (!user.isTermsAccepted || !user.currencyCode || !user.locale) {
      const currentState =
        (await CacheHelper.getState<SignupState>(tUser.id)) || initialState
      const nextState: SignupState = await parseInput(
        msg,
        tUser.id,
        user.t,
        currentState
      )

      return sendResponse(msg, user.t, nextState)
    } else {
      return false
    }
  },

  async handleCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    if (!user.isTermsAccepted || !user.currencyCode || !user.locale) {
      const currentState =
        (await CacheHelper.getState<SignupState>(tUser.id)) || initialState
      const nextState: SignupState = await parseInput(
        msg,
        tUser.id,
        user.t,
        currentState
      )

      return sendResponse(msg, user.t, nextState)
    } else {
      return false
    }
  }
}

async function parseInput(
  msg: TelegramBot.Message,
  telegramId: number,
  t: any,
  currentState: SignupState
): Promise<SignupState> {
  switch (currentState.currentMessageKey) {
    case 'start':
      const deepLinks = parseDeepLink(msg)
      currentState.start = {
        deeplink: get(deepLinks, 'key', null),
        value: get(deepLinks, 'value', null)
      }
      return await moveToNextState<SignupState>(
        currentState,
        signupFlow,
        telegramId
      )

    case 'language':
      const chosenLanguage = findKey(LanguageView, (v) => v === msg.text) as
        | Language
        | undefined

      if (chosenLanguage) {
        currentState.language = chosenLanguage
        return await moveToNextState<SignupState>(
          currentState,
          signupFlow,
          telegramId
        )
      } else {
        logger.warn('User selected invalid language ' + msg.text)
        return currentState
      }

    case 'welcome':
      return await moveToNextState<SignupState>(
        currentState,
        signupFlow,
        telegramId
      )

    case 'termsAndConditions':
      if (msg.text === t(`${Namespace.Signup}:terms-agree-button`)) {
        currentState.termsAndConditions = true
        return await moveToNextState<SignupState>(
          currentState,
          signupFlow,
          telegramId
        )
      }
      return currentState

    case 'fiatCurrency':
      const chosenFiatCurrency: FiatCurrency | undefined = findKey(
        FiatCurrency,
        (c) => c === msg.text
      ) as FiatCurrency
      if (chosenFiatCurrency) {
        currentState.fiatCurrency = chosenFiatCurrency
        return await moveToNextState<SignupState>(
          currentState,
          signupFlow,
          telegramId
        )
      } else {
        logger.warn('User selected invalid fiat currency')
        return currentState
      }

    case 'accountReady':
      logger.error('Save to DB and end state')
      return await moveToNextState<SignupState>(
        currentState,
        signupFlow,
        telegramId
      )
  }
}

async function sendResponse(
  msg: TelegramBot.Message,
  t: any,
  nextState: SignupState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'language':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        t(`${Namespace.Signup}:choose-language`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: languageKeyboard,
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'welcome':
      await telegramHook.getWebhook.sendSticker(
        msg.chat.id,
        'CAADAgADKgMAAs-71A4f8rUYf2WfMAI'
      )
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        t(`${Namespace.Signup}:welcome-message`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [{ text: t(`${Namespace.Signup}:welcome-continue-button`) }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      break

    case 'termsAndConditions':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        t(`${Namespace.Signup}:terms-and-conditions`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[{ text: t(`${Namespace.Signup}:terms-agree-button`) }]],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'fiatCurrency':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        t(`${Namespace.Signup}:select-currency`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: currencyKeyboard,
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'accountReady':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        t(`${Namespace.Signup}:account-ready`, {
          bitcoinAddress: '3QJmV3qfvL9SuYo34YihAf3sRCW3qSinyC'
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [{ text: t(`${Namespace.Signup}:account-ready-continue-button`) }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true
  }

  return false
}
