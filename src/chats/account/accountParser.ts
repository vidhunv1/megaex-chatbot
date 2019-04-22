import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import {
  AccountState,
  AccountStateKey,
  PaymentMethodFields,
  AccountError
} from './AccountState'
import logger from 'modules/Logger'
import * as _ from 'lodash'
import {
  PaymentMethods,
  PaymentMethodAvailability,
  PaymentMethodsFieldsLocale
} from 'constants/paymentMethods'
import { FiatCurrency } from 'constants/currencies'
import { Language } from 'constants/languages'
import { Account } from 'lib/Account'
import { ExchangeSource } from 'constants/exchangeSource'

const getReferralLink = () => {
  return 'https://t.me/megadealsbot?start=ref-fqwkjqel'
}

const getReferralCount = () => {
  return 0
}

const getReferralFees = () => {
  return 90
}

const getAccountId = () => {
  return 'U9SAE8'
}

const getTotalDeals = () => {
  return 100
}

const getTotalVolume = () => {
  return 100
}

const getAvgSpeed = () => {
  return 120
}

const getEarnings = () => {
  return 5
}

const getRating = () => {
  return {
    totalPercentage: 98,
    upVotes: 100,
    downVotes: 3
  }
}

const savePaymentMethod = (_pm: any) => {
  return true
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
  logger.error('TODO: Update username ' + username)
  return false
}

const getAllPaymentMethods = (currencyCode: FiatCurrency): PaymentMethods[] =>
  // @ts-ignore
  Object.keys(PaymentMethodAvailability).filter(
    // @ts-ignore
    (key) => PaymentMethodAvailability[key] === currencyCode || 'ALL'
  )

const getAddedPaymentMethods = (id?: number): PaymentMethodFields[] => {
  const pms = [
    {
      id: 1,
      paymentMethod: PaymentMethods.BANK_TRANSFER_INR,
      fields: ['Axis Bank', '10291029120912', 'IOBA000124']
    },
    {
      id: 2,
      paymentMethod: PaymentMethods.PAYTM,
      fields: ['+91 9999999999']
    }
  ]

  if (id) {
    const pm = _.find(pms, { id })
    if (pm) {
      return [pm]
    }
    return []
  }

  return pms
}

export async function accountParser(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  currentState: AccountState
): Promise<AccountState | null> {
  const stateKey = currentState.currentStateKey
  switch (stateKey) {
    case AccountStateKey.start:
      return {
        ...currentState,
        [AccountStateKey.start]: {
          data: {
            accountId: getAccountId(),
            totalDeals: getTotalDeals(),
            totalVolume: getTotalVolume(),
            avgSpeedSec: getAvgSpeed(),
            rating: getRating(),
            referralCount: getReferralCount(),
            totalEarnings: getEarnings(),
            addedPaymentMethods: getAddedPaymentMethods().map(
              (pm) => pm.paymentMethod
            )
          }
        }
      }
    case AccountStateKey.account:
      return null

    case AccountStateKey.cb_paymentMethods: {
      const cbState = _.get(
        currentState,
        AccountStateKey.cb_paymentMethods,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [AccountStateKey.cb_paymentMethods]: {
          ...cbState,
          data: {
            addedPaymentMethods: getAddedPaymentMethods()
          }
        }
      }
    }

    case AccountStateKey.cb_editPaymentMethods: {
      const cbState = _.get(
        currentState,
        AccountStateKey.cb_editPaymentMethods,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [AccountStateKey.cb_editPaymentMethods]: {
          ...cbState,
          data: {
            addedPaymentMethods: getAddedPaymentMethods()
          }
        }
      }
    }

    case AccountStateKey.cb_addPaymentMethod: {
      const cbState = _.get(
        currentState,
        AccountStateKey.cb_addPaymentMethod,
        null
      )
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [AccountStateKey.cb_addPaymentMethod]: {
          ...cbState,
          data: {
            paymentMethodsList: getAllPaymentMethods(user.currencyCode)
          }
        }
      }
    }

    case AccountStateKey.cb_referralLink: {
      const cbState = _.get(currentState, AccountStateKey.cb_referralLink, null)
      if (cbState == null) {
        return null
      }

      return {
        ...currentState,
        [AccountStateKey.cb_referralLink]: {
          ...cbState,
          data: {
            referralLink: getReferralLink(),
            referralCount: getReferralCount(),
            referralFeesPercentage: getReferralFees()
          }
        }
      }
    }

    case AccountStateKey.paymentMethodInput: {
      if (!msg.text) {
        return null
      }

      const pmInputState = _.get(
        currentState,
        AccountStateKey.paymentMethodInput,
        null
      )

      // Parse input fields
      if (
        pmInputState &&
        pmInputState.data &&
        pmInputState.data.inputs.paymentMethod != null
      ) {
        const { inputs } = pmInputState.data
        if (
          inputs.fields.length <
          PaymentMethodsFieldsLocale[inputs.paymentMethod].length - 1
        ) {
          return {
            ...currentState,
            [AccountStateKey.paymentMethodInput]: {
              data: {
                inputs: {
                  ...inputs,
                  fields: inputs.fields.concat(msg.text)
                },
                isSaved: false
              },
              error: null
            }
          }
        } else if (
          inputs.fields.length ===
          PaymentMethodsFieldsLocale[inputs.paymentMethod].length - 1
        ) {
          const isSaved = savePaymentMethod(inputs)
          if (isSaved) {
            return {
              ...currentState,
              [AccountStateKey.paymentMethodInput]: {
                data: {
                  inputs: {
                    ...inputs,
                    fields: inputs.fields.concat(msg.text)
                  },
                  isSaved: true
                },
                error: null
              }
            }
          } else {
            return {
              ...currentState,
              [AccountStateKey.paymentMethodInput]: {
                data: null,
                error: AccountError.ERROR_CREATING_PAYMENT_METHOD
              }
            }
          }
        } else {
          logger.error('INVALID STATE: accountParse#parseMethodInput')
          return null
        }
      }

      // Parse Payment method
      const findPM = getAllPaymentMethods(user.currencyCode).find(
        (pm) => msg.text === user.t(`payment-methods.names.${pm}`)
      )

      const inputs = _.get(
        currentState,
        `${AccountStateKey.paymentMethodInput}.data.inputs`,
        null
      )

      if (findPM) {
        return {
          ...currentState,
          [AccountStateKey.paymentMethodInput]: {
            data: {
              inputs: {
                ...inputs,
                paymentMethod: findPM as PaymentMethods,
                fields: []
              },
              isSaved: false
            },
            error: null
          }
        }
      } else {
        return {
          ...currentState,
          [AccountStateKey.paymentMethodInput]: {
            data: null,
            error: AccountError.INVALID_PAYMENT_METHOD
          }
        }
      }
    }

    case AccountStateKey.cb_editPaymentMethodId: {
      const cbState = _.get(
        currentState,
        AccountStateKey.cb_editPaymentMethodId,
        null
      )
      if (!cbState) {
        return null
      }

      return {
        ...currentState,
        [AccountStateKey.paymentMethodInput]: {
          data: {
            inputs: {
              paymentMethod: getAddedPaymentMethods(+cbState.paymentMethodId)[0]
                .paymentMethod,
              editId: parseInt(cbState.paymentMethodId + ''),
              fields: []
            },
            isSaved: false
          },
          error: null
        }
      }
    }

    case AccountStateKey.editPaymentMethod_show:
      return currentState

    case AccountStateKey.cb_settings: {
      return currentState
    }

    case AccountStateKey.cb_settingsCurrency: {
      return {
        ...currentState,
        [AccountStateKey.settingsCurrency_show]: {
          data: {
            cursor: 0
          }
        }
      }
    }

    case AccountStateKey.cb_settingsLanguage: {
      return currentState
    }

    case AccountStateKey.cb_settingsRate: {
      return currentState
    }

    case AccountStateKey.cb_settingsUsername: {
      return currentState
    }

    case AccountStateKey.cb_loadMore: {
      const cursor = _.get(
        currentState[AccountStateKey.cb_loadMore],
        'cursor',
        null
      )

      return {
        ...currentState,
        [AccountStateKey.settingsCurrency_show]: {
          data: {
            cursor: cursor || 0
          }
        }
      }
    }

    case AccountStateKey.settingsCurrency_show: {
      return currentState
    }

    case AccountStateKey.settingsUsername_show: {
      const username = msg.text

      const errorResp: AccountState = {
        ...currentState,
        [AccountStateKey.settingsUsername_show]: {
          username: username || '',
          data: null,
          error: AccountError.INVALID_USERNAME
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
        [AccountStateKey.settingsUsername_show]: {
          username: username || '',
          data: null,
          error: null
        }
      }
    }

    case AccountStateKey.settings_show:
      return currentState

    case AccountStateKey.cb_settingsCurrency_update: {
      const currencyCode = _.get(
        currentState[AccountStateKey.cb_settingsCurrency_update],
        'currency',
        null
      )
      if (currencyCode == null) {
        return null
      }

      await updateCurrency(currencyCode, user, tUser)
      return currentState
    }

    case AccountStateKey.cb_settingsLanguage_update: {
      const language = _.get(
        currentState[AccountStateKey.cb_settingsLanguage_update],
        'lang',
        null
      )
      if (language == null) {
        return null
      }

      await updateLanguage(language, user, tUser)
      return currentState
    }

    case AccountStateKey.cb_settingsRate_update: {
      const rateSource = _.get(
        currentState[AccountStateKey.cb_settingsRate_update],
        'rateSource'
      )
      if (rateSource == null) {
        return null
      }

      await updateRateSource(rateSource, user, tUser)
      return currentState
    }

    default:
      logger.error(
        `Unhandled accountParser: default ${currentState.currentStateKey}`
      )
      return null
  }
}
