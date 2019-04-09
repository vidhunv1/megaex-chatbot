import { Language } from 'constants/languages'
import { FiatCurrency } from 'constants/currencies'
import { State, StateFlow, DeepLink } from 'chats/types'

export interface ISignupState {
  start?: { deeplink: DeepLink | null; value: string | null }
  language?: Language
  welcome?: boolean
  termsAndConditions?: boolean
  fiatCurrency?: FiatCurrency
  accountReady?: boolean
}

export interface SignupState extends State<ISignupState>, ISignupState {}

export const signupFlow: StateFlow<ISignupState> = {
  start: 'language',
  language: 'welcome',
  welcome: 'termsAndConditions',
  termsAndConditions: 'fiatCurrency',
  fiatCurrency: 'accountReady',
  accountReady: null
}

export const initialState: SignupState = {
  currentMessageKey: 'start'
}
