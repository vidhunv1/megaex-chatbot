import * as TelegramBot from 'node-telegram-bot-api'
import { parseDeepLink } from 'chats/utils'
import { SignupState, SignupStateKey, SignupError } from './SignupState'
import logger from 'modules/Logger'
import { LanguageView, Language } from 'constants/languages'
import { Account } from 'lib/Account'
import { FiatCurrency } from 'constants/currencies'
import { User, UserInfo } from 'models'
import { Namespace } from 'modules/i18n'
import * as _ from 'lodash'
import { DeepLink } from 'chats/types'
import Referral from 'models/Referral'

export async function signupParser(
  msg: TelegramBot.Message,
  telegramId: number,
  user: User,
  currentState: SignupState
): Promise<SignupState | null> {
  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case SignupStateKey.start: {
      const deepLinks = parseDeepLink(msg)

      return {
        ...currentState,
        [SignupStateKey.start]: {
          data: {
            deeplink: _.get(deepLinks, 'key', null),
            value: _.get(deepLinks, 'value', null)
          }
        }
      }
    }

    case SignupStateKey.language: {
      const chosenLanguage = _.findKey(LanguageView, (v) => v === msg.text) as
        | Language
        | undefined

      if (chosenLanguage) {
        return {
          ...currentState,
          [SignupStateKey.language]: {
            data: {
              language: chosenLanguage
            },
            error: null
          }
        }
      } else {
        logger.warn('User selected invalid language ' + msg.text)
        return {
          ...currentState,
          [SignupStateKey.language]: {
            data: null,
            error: SignupError.INVALID_LANGUAGE
          }
        }
      }
    }

    case SignupStateKey.termsAndConditions: {
      let isAccepted = false
      if (msg.text === user.t(`${Namespace.Signup}:terms-agree-button`)) {
        isAccepted = true
      }
      return {
        ...currentState,
        [SignupStateKey.termsAndConditions]: {
          data: {
            isAccepted
          }
        }
      }
    }

    case SignupStateKey.fiatCurrency: {
      /*
          Tests:
            USD -> valid
            usd -> Valid
            USD ($) -> valid
        */
      const chosenFiatCurrency: FiatCurrency | undefined = _.findKey(
        FiatCurrency,
        (c) =>
          msg.text &&
          c.toLowerCase() === msg.text.replace(/[^a-z]/gi, '').toLowerCase()
      ) as FiatCurrency

      if (chosenFiatCurrency) {
        const isTermsAccepted = _.get(
          currentState[SignupStateKey.termsAndConditions],
          'data.isAccepted',
          false
        )
        const locale = _.get(
          currentState[SignupStateKey.language],
          'data.language',
          Language.ENGLISH
        )

        const nextState = {
          ...currentState,
          [SignupStateKey.fiatCurrency]: {
            data: {
              currencyCode: chosenFiatCurrency
            },
            error: null
          }
        }

        try {
          if (isTermsAccepted && locale) {
            // TODO: Clear user cache in the User model. So everytime it updates cache is cleared.

            await User.update(
              {
                locale,
                isTermsAccepted,
                currencyCode: chosenFiatCurrency
              },
              { where: { id: user.id } }
            )

            await Account.clearUserCache(telegramId)

            return nextState
          } else {
            logger.error(
              'signupParser: fiatCurrency | termsAndConditions undefined.. this shouldnt have happened' +
                JSON.stringify(nextState)
            )
            return {
              ...currentState,
              [SignupStateKey.fiatCurrency]: {
                data: null,
                error: SignupError.UNKNOWN
              }
            }
          }
        } catch (e) {
          logger.error('accountReady error - SignupChat')
          return {
            ...currentState,
            [SignupStateKey.fiatCurrency]: {
              data: null,
              error: SignupError.CREATE_ERROR
            }
          }
        }
      } else {
        logger.warn('User selected invalid fiat currency')
        return {
          ...currentState,
          [SignupStateKey.fiatCurrency]: {
            data: null,
            error: SignupError.INVALID_FIAT_CURRENCY
          }
        }
      }
    }

    case SignupStateKey.accountReady:
      const data = _.get(currentState[SignupStateKey.start], 'data', null)
      if (data != null && data.deeplink != null && data.value != null) {
        switch (data.deeplink) {
          case DeepLink.REFERRAL:
            const referredByUser = await User.findOne({
              where: { accountId: data.value }
            })
            if (referredByUser) {
              await Referral.createReferral(referredByUser.id, user.id)
            }
            break

          case DeepLink.TRACK:
            await UserInfo.create<UserInfo>({
              userId: user.id,
              tracking: data.value
            })
            break
        }
      }
      return currentState

    case SignupStateKey.homeScreen:
      return null
    case SignupStateKey.signupError:
      return currentState
  }
}
