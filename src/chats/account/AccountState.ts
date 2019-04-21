import { State, CallbackDefaults } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import logger from 'modules/Logger'
import { PaymentMethods } from 'constants/paymentMethods'
import * as _ from 'lodash'

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
  cb_settingsLanguage = 'cb_settingsLanguage',
  cb_settingsRate = 'cb_settingsRate',
  cb_settingsUsername = 'cb_settingsUsername',

  paymentMethod_error = 'paymentMethod_error'
}

export const STATE_EXPIRY = 86400

export type PaymentMethodFields = {
  id: number
  paymentMethod: PaymentMethods
  fields: string[]
}

export enum AccountError {
  INVALID_PAYMENT_METHOD = 'INVALID_PAYMENT_METHOD',
  ERROR_CREATING_PAYMENT_METHOD = 'ERROR_CREATING_PAYMENT_METHOD'
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
    data: {} | null
  } & CallbackDefaults

  [AccountStateKey.cb_settingsCurrency]?: {
    data: {} | null
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

    case AccountStateKey.paymentMethodInput: {
      const pmInputState = _.get(
        currentState,
        AccountStateKey.paymentMethodInput,
        null
      )

      if (pmInputState && pmInputState.error) {
        return AccountStateKey.paymentMethod_error
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
