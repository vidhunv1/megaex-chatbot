import * as TelegramBot from 'node-telegram-bot-api'
import { parseDeepLink } from 'chats/utils'
import { SignupState, nextSignupState } from './SignupState'
import { get, findKey } from 'lodash'
import logger from 'modules/Logger'
import { LanguageView, Language } from 'constants/languages'
import { Account } from 'lib/Account'
import { FiatCurrency } from 'constants/currencies'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export async function signupParser(
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
