import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount, Wallet } from 'models'
import { ChatHandler } from 'chats/types'
import { parseDeepLink } from 'chats/utils'
import telegramHook from 'modules/TelegramHook'
import {
  SignupState,
  initialState,
  nextSignupState,
  SIGNUP_STATE_KEY
} from './SignupState'
import { CacheHelper } from 'lib/CacheHelper'
import { Namespace } from 'modules/I18n'
import { get, findKey } from 'lodash'
import logger from 'modules/Logger'
import { LanguageView, Language } from 'constants/languages'
import { languageKeyboard, currencyKeyboard } from './utils'
import { FiatCurrency, CryptoCurrency } from 'constants/currencies'
import { Account } from 'lib/Account'
import { defaultKeyboardMenu } from 'chats/common'

export const SignupChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: SignupState | null
  ) {
    if (
      !user.isTermsAccepted ||
      !user.currencyCode ||
      !user.locale ||
      (state && state.key === SIGNUP_STATE_KEY)
    ) {
      const currentState =
        (await CacheHelper.getState<SignupState>(tUser.id)) || initialState

      const nextState: SignupState | null = await parseInput(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return sendResponse(msg, user, nextState)
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
    tUser: TelegramAccount,
    state: SignupState | null
  ) {
    if (
      (state && state.key === SIGNUP_STATE_KEY) ||
      !user.isTermsAccepted ||
      !user.currencyCode ||
      !user.locale
    ) {
      const currentState = state as SignupState

      const nextState: SignupState | null = await parseInput(
        msg,
        tUser.id,
        user,
        currentState || initialState
      )

      if (nextState === null) {
        return false
      }

      return sendResponse(msg, user, nextState)
    } else {
      return false
    }
  }
}

// PARSE INPUT
async function parseInput(
  msg: TelegramBot.Message,
  telegramId: number,
  user: User,
  currentState: SignupState
): Promise<SignupState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      const deepLinks = parseDeepLink(msg)
      currentState.start = {
        deeplink: get(deepLinks, 'key', null),
        value: get(deepLinks, 'value', null)
      }
      return await nextSignupState(currentState, telegramId)

    case 'language':
      const chosenLanguage = findKey(LanguageView, (v) => v === msg.text) as
        | Language
        | undefined

      if (chosenLanguage) {
        currentState.language = chosenLanguage
        return await nextSignupState(currentState, telegramId)
      } else {
        logger.warn('User selected invalid language ' + msg.text)
        return currentState
      }

    case 'termsAndConditions':
      if (msg.text === user.t(`${Namespace.Signup}:terms-agree-button`)) {
        currentState.termsAndConditions = true
        return await nextSignupState(currentState, telegramId)
      }
      return currentState

    case 'fiatCurrency':
      /*
        Tests:
          USD -> valid
          usd -> Valid
          USD ($) -> valid
      */
      const chosenFiatCurrency: FiatCurrency | undefined = findKey(
        FiatCurrency,
        (c) =>
          msg.text &&
          c.toLowerCase() === msg.text.replace(/[^a-z]/gi, '').toLowerCase()
      ) as FiatCurrency
      if (chosenFiatCurrency) {
        currentState.fiatCurrency = chosenFiatCurrency

        try {
          if (currentState.fiatCurrency && currentState.termsAndConditions) {
            // TODO: Clear user cache in the User model. So everytime it updates cache is cleared.

            await User.update(
              {
                locale: currentState.language,
                isTermsAccepted: currentState.termsAndConditions,
                currencyCode: currentState.fiatCurrency
              },
              { where: { id: user.id } }
            )
            await Account.clearUserCache(telegramId)
            return await nextSignupState(currentState, telegramId)
          } else {
            throw new Error(
              'fiatCurrency | termsAndConditions undefined.. this shouldnt have happened'
            )
          }
        } catch (e) {
          logger.error('accountReady error - SignupChat')
          throw e
        }
      } else {
        logger.warn('User selected invalid fiat currency')
        return currentState
      }

    case 'accountReady':
      // TODO: Handle deeplinks
      logger.error(`Handle deeplinks ${JSON.stringify(currentState)}`)
      return await nextSignupState(currentState, telegramId)

    case 'homeScreen':
      return await nextSignupState(currentState, telegramId)
  }
}

// SEND RESPONSE
async function sendResponse(
  msg: TelegramBot.Message,
  user: User,
  nextState: SignupState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'language':
      await telegramHook.getWebhook.sendSticker(
        msg.chat.id,
        'CAADAgADKgMAAs-71A4f8rUYf2WfMAI'
      )
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:choose-language`, {
          name: msg.from && msg.from.first_name
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: languageKeyboard,
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'termsAndConditions':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:terms-and-conditions`),
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: {
            keyboard: [
              [{ text: user.t(`${Namespace.Signup}:terms-agree-button`) }]
            ],
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'fiatCurrency':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:select-currency`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: currencyKeyboard,
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'accountReady':
      const wallet = await Wallet.findOne({
        where: {
          userId: user.id,
          currencyCode: CryptoCurrency.BTC
        }
      })

      let message
      if (wallet) {
        message = user.t(`${Namespace.Signup}:account-ready`, {
          accountID: user.accountId,
          bitcoinAddress: wallet.address
        })
      } else {
        message = user.t(
          `${Namespace.Signup}:account-ready-generating-address`,
          { accountID: user.accountId }
        )
      }

      await telegramHook.getWebhook.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t(
                  `${Namespace.Signup}:account-ready-continue-button`
                )
              }
            ]
          ],
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
      return true

    case 'homeScreen':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:home-screen`),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user)
        }
      )
      return true
  }

  return false
}
