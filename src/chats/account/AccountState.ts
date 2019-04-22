import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import logger from 'modules/Logger'
import { PaymentMethods } from 'constants/paymentMethods'
import * as _ from 'lodash'
import { FiatCurrency } from 'constants/currencies'
import { Language } from 'constants/languages'
import { ExchangeSource } from 'constants/exchangeSource'

export const ACCOUNT_STATE_LABEL = 'account'

export enum AccountStateKey {
  start = 'start',
  account = 'account',

  cb_paymentMethods = 'cb_paymentMethods',
  paymentMethods_show = 'paymentMethods_show',

  cb_editPaymentMethods = 'cb_editPaymentMethods',
  editPaymentMethod_show = 'editPaymentMethod_show',
  cb_editPaymentMethodId = 'cb_editPaymentMethodId',

  cb_addPaymentMethod = 'cb_addPaymentMethod',

  paymentMethodInput = 'paymentMethodInput',
  paymentMethodCreated = 'paymentMethodCreated',

  cb_referralLink = 'cb_referralLink',
  referralLink_show = 'referralLink_show',

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

  account_error = 'account_error',

  cb_loadMore = 'cb_loadMore',

  cb_settingsCurrency_update = 'cb_settingsCurrency_update',
  cb_settingsLanguage_update = 'cb_settingsLanguage_update',
  cb_settingsRate_update = 'cb_settingsRate_update',
  cb_settingsUsername_update = 'cb_settingsUsername_update',
  settingsUpdateResult = 'cb_settingsUpdateResult'
}

export const STATE_EXPIRY = 86400

export type PaymentMethodFields = {
  id: number
  paymentMethod: PaymentMethods
  fields: string[]
}

export enum AccountError {
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  ERROR_CREATING_PAYMENT_METHOD = 'ERROR_CREATING_PAYMENT_METHOD',
  INVALID_USERNAME = 'INVALID_USERNAME'
}

export interface IAccountState {
  [AccountStateKey.start]?: {
    data: {
      accountId: string
      totalDeals: number
      totalVolume: number
      avgSpeedSec: number
      rating: {
        totalPercentage: number
        upVotes: number
        downVotes: number
      }
      referralCount: number
      totalEarnings: number
      addedPaymentMethods: PaymentMethods[]
    } | null
  }

  [AccountStateKey.cb_paymentMethods]?: {
    data: {
      addedPaymentMethods: PaymentMethodFields[]
    } | null
  } & CallbackDefaults

  [AccountStateKey.cb_settings]?: {
    isFromBack: boolean
    data: {} | null
  } & CallbackDefaults

  [AccountStateKey.cb_settingsCurrency]?: {
    data: {} | null
  } & CallbackDefaults
  [AccountStateKey.settingsCurrency_show]?: {
    data: {
      cursor: number
    } | null
  }
  [AccountStateKey.cb_loadMore]?: {
    cursor: number
  } & CallbackDefaults
  [AccountStateKey.cb_settingsLanguage]?: {
    data: {} | null
  } & CallbackDefaults
  [AccountStateKey.cb_settingsRate]?: {
    data: {} | null
  } & CallbackDefaults
  [AccountStateKey.cb_settingsUsername]?: {
    data: {} | null
  } & CallbackDefaults

  [AccountStateKey.cb_referralLink]?: {
    data: {
      referralLink: string
      referralCount: number
      referralFeesPercentage: number
    } | null
  } & CallbackDefaults

  [AccountStateKey.cb_editPaymentMethods]?: {
    data: {
      addedPaymentMethods: PaymentMethodFields[]
    } | null
  } & CallbackDefaults

  [AccountStateKey.cb_editPaymentMethodId]?: {
    paymentMethodId: number
    data: {} | null
  } & CallbackDefaults

  [AccountStateKey.cb_addPaymentMethod]?: {
    data: {
      paymentMethodsList: PaymentMethods[]
    } | null
  } & CallbackDefaults

  [AccountStateKey.paymentMethodInput]?: {
    data: {
      inputs: {
        paymentMethod: PaymentMethods
        editId: number | null
        fields: string[]
      }
      isSaved: boolean
    } | null
    error:
      | AccountError.INVALID_PAYMENT_METHOD
      | AccountError.ERROR_CREATING_PAYMENT_METHOD
      | null
  }

  [AccountStateKey.cb_settingsCurrency_update]?: {
    currency: FiatCurrency
    data: {} | null
  }
  [AccountStateKey.cb_settingsLanguage_update]?: {
    lang: Language
    data: {} | null
  }
  [AccountStateKey.cb_settingsRate_update]?: {
    rateSource: ExchangeSource
    data: {} | null
  }
  [AccountStateKey.cb_settingsUsername_update]?: {
    username: string
    data: {} | null
    error: AccountError.INVALID_USERNAME
  }
}

export interface AccountState extends State<AccountStateKey>, IAccountState {}

export function getNextStateKey(
  currentState: AccountState | null
): AccountStateKey | null {
  if (!currentState) {
    return null
  }

  const stateKey = currentState.currentStateKey

  switch (stateKey) {
    case AccountStateKey.start:
      return AccountStateKey.account
    case AccountStateKey.account:
      return null

    case AccountStateKey.cb_paymentMethods:
      return AccountStateKey.paymentMethods_show
    case AccountStateKey.paymentMethods_show:
      return null

    case AccountStateKey.cb_editPaymentMethods:
      return AccountStateKey.editPaymentMethod_show
    case AccountStateKey.editPaymentMethod_show:
      return null

    case AccountStateKey.cb_editPaymentMethodId:
      return AccountStateKey.paymentMethodInput

    case AccountStateKey.cb_addPaymentMethod:
      return AccountStateKey.paymentMethodInput

    case AccountStateKey.cb_referralLink:
      return AccountStateKey.referralLink_show
    case AccountStateKey.referralLink_show:
      return null

    case AccountStateKey.cb_settings:
      return AccountStateKey.settings_show
    case AccountStateKey.settings_show:
      return null

    case AccountStateKey.cb_settingsLanguage:
      return AccountStateKey.settingsLanguage_show
    case AccountStateKey.cb_settingsCurrency:
      return AccountStateKey.settingsCurrency_show
    case AccountStateKey.cb_settingsRate:
      return AccountStateKey.settingsRate_show
    case AccountStateKey.cb_settingsUsername:
      return AccountStateKey.settingsUsername_show

    case AccountStateKey.paymentMethodInput: {
      const pmInputState = _.get(
        currentState,
        AccountStateKey.paymentMethodInput,
        null
      )

      if (pmInputState && pmInputState.error) {
        return AccountStateKey.account_error
      }

      if (!pmInputState || !pmInputState.data) {
        return AccountStateKey.paymentMethodInput
      }

      if (pmInputState.data.isSaved) {
        return AccountStateKey.paymentMethodCreated
      } else {
        return AccountStateKey.paymentMethodInput
      }
    }

    case AccountStateKey.paymentMethodCreated: {
      return null
    }

    case AccountStateKey.account_error: {
      return null
    }

    case AccountStateKey.cb_loadMore: {
      return AccountStateKey.settingsCurrency_show
    }

    case AccountStateKey.cb_settingsCurrency_update: {
      return AccountStateKey.settingsCurrency_show
    }
    case AccountStateKey.cb_settingsUsername_update: {
      const isError = _.get(
        currentState[AccountStateKey.cb_settingsUsername_update],
        'error',
        null
      )

      if (isError == null || isError === AccountError.INVALID_USERNAME) {
        return AccountStateKey.account_error
      }
      return AccountStateKey.settingsUpdateResult
    }
    case AccountStateKey.cb_settingsRate_update: {
      return AccountStateKey.settingsRate_show
    }
    case AccountStateKey.cb_settingsLanguage_update: {
      return AccountStateKey.settingsLanguage_show
    }
  }

  logger.error(`Unhandled case: AccountState.getNextStateKey ${stateKey}`)
  return null
}

export const initialState: AccountState = Object.freeze({
  currentStateKey: AccountStateKey.start,
  previousStateKey: null,
  key: ACCOUNT_STATE_LABEL
})

export async function nextAccountState(
  currentState: AccountState | null,
  telegramId: number
): Promise<AccountState | null> {
  const nextStateKey = getNextStateKey(currentState)

  return await moveToNextState<AccountStateKey>(
    currentState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
