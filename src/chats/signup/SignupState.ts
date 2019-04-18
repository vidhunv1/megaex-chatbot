import { Language } from 'constants/languages'
import { FiatCurrency } from 'constants/currencies'
import { State, DeepLink } from 'chats/types'
import { moveToNextState } from 'chats/utils'

export const STATE_EXPIRY = 86400

export const SIGNUP_STATE_LABEL = 'signup'

export enum SignupStateKey {
  start = 'start',
  language = 'language',
  termsAndConditions = 'termsAndConditions',
  fiatCurrency = 'fiatCurrency',
  accountReady = 'accountReady',
  homeScreen = 'homeScreen',
  signupError = 'signupError'
}

export enum SignupError {
  CREATE_ERROR = 'CREATE_ERROR',
  UNKNOWN = 'UNKNOWN',
  INVALID_LANGUAGE = 'INVALID_LANGUAGE',
  INVALID_FIAT_CURRENCY = 'INVALID_FIAT_CURRENCY'
}

export interface ISignupState {
  [SignupStateKey.start]?: {
    data: {
      deeplink: DeepLink | null
      value: string | null
    } | null
  }
  [SignupStateKey.language]?: {
    data: {
      language: Language
    } | null
    error: SignupError.INVALID_LANGUAGE | null
  }
  [SignupStateKey.termsAndConditions]?: {
    data: {
      isAccepted: boolean
    } | null
  }
  [SignupStateKey.fiatCurrency]?: {
    data: {
      currencyCode: FiatCurrency
    } | null
    error:
      | SignupError.INVALID_FIAT_CURRENCY
      | SignupError.CREATE_ERROR
      | SignupError.UNKNOWN
      | null
  }
}

export interface SignupState extends State<SignupStateKey>, ISignupState {}

export function getNextStateKey(
  currentState: SignupState | null
): SignupStateKey | null {
  if (!currentState) {
    return null
  }
  const stateKey = currentState.currentStateKey

  switch (stateKey) {
    case SignupStateKey.start: {
      return SignupStateKey.language
    }

    case SignupStateKey.signupError: {
      return null
    }

    case SignupStateKey.language: {
      const languageState = currentState[SignupStateKey.language]
      if (!languageState) {
        return null
      }

      if (languageState.error) {
        return SignupStateKey.language
      }
      return SignupStateKey.termsAndConditions
    }

    case SignupStateKey.termsAndConditions: {
      const termsState = currentState[SignupStateKey.termsAndConditions]
      if (!termsState || !termsState.data) {
        return null
      }

      if (!termsState.data.isAccepted) {
        return SignupStateKey.termsAndConditions
      }
      return SignupStateKey.fiatCurrency
    }

    case SignupStateKey.fiatCurrency: {
      const fiatCurrencyState = currentState[SignupStateKey.fiatCurrency]
      if (!fiatCurrencyState) {
        return null
      }

      if (fiatCurrencyState.error) {
        if (fiatCurrencyState.error === SignupError.INVALID_FIAT_CURRENCY) {
          return SignupStateKey.fiatCurrency
        } else if (fiatCurrencyState.error === SignupError.CREATE_ERROR) {
          return SignupStateKey.signupError
        } else if (fiatCurrencyState.error === SignupError.UNKNOWN) {
          return SignupStateKey.signupError
        }
      }
      return SignupStateKey.accountReady
    }

    case SignupStateKey.accountReady: {
      return SignupStateKey.homeScreen
    }

    case SignupStateKey.homeScreen: {
      return null
    }
  }
}

export const initialState: SignupState = {
  currentStateKey: SignupStateKey.start,
  previousStateKey: null,
  key: SIGNUP_STATE_LABEL
}

export async function nextSignupState(
  currentState: SignupState | null,
  telegramId: number
): Promise<SignupState | null> {
  const nextStateKey = getNextStateKey(currentState)

  return await moveToNextState<SignupStateKey>(
    currentState,
    telegramId,
    nextStateKey,
    STATE_EXPIRY
  )
}
