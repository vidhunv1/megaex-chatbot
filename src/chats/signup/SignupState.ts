import { Language } from 'constants/languages'
import { FiatCurrency } from 'constants/currencies'
import { State, StateFlow, DeepLink } from 'chats/types'
import { moveToNextState } from 'chats/utils'

export const STATE_EXPIRY = 86400

export const SIGNUP_STATE_KEY = 'signup'

export interface ISignupState {
  start?: { deeplink: DeepLink | null; value: string | null }
  language?: Language
  termsAndConditions?: boolean
  fiatCurrency?: FiatCurrency
  accountReady?: boolean
  homeScreen?: boolean
}

export interface SignupState extends State<ISignupState>, ISignupState {}

export const signupFlow: StateFlow<ISignupState> = {
  start: 'language',
  language: 'termsAndConditions',
  termsAndConditions: 'fiatCurrency',
  fiatCurrency: 'accountReady',
  accountReady: 'homeScreen',
  homeScreen: null
}

export const initialState: SignupState = {
  currentMessageKey: 'start',
  key: SIGNUP_STATE_KEY
}

export async function nextSignupState(
  currentState: SignupState,
  telegramId: number
): Promise<SignupState | null> {
  return await moveToNextState<SignupState>(
    currentState,
    signupFlow,
    telegramId,
    STATE_EXPIRY
  )
}
