import { Language } from 'constants/languages'
import { FiatCurrency } from 'constants/currencies'
import { State, StateFlow } from 'chats/types'
// import { moveToNextState } from '../utils'

interface ISignupState {
  language?: Language
  welcome?: boolean
  termsAndConditions?: boolean
  fiatCurrency?: FiatCurrency
  accountReady?: boolean
}

export interface SignupState extends State<ISignupState>, ISignupState {}

// export const InitialState: keyof Signup = 'language'

export const SignupFlow: StateFlow<ISignupState> = {
  language: 'welcome',
  welcome: 'termsAndConditions',
  termsAndConditions: 'fiatCurrency',
  fiatCurrency: 'accountReady',
  accountReady: null
}

export const InitialState: SignupState = {
  language: undefined,
  welcome: false,
  termsAndConditions: false,
  fiatCurrency: undefined,
  accountReady: false,
  current: 'language'
}

export const updateToNextState = (
  current: keyof ISignupState
): keyof ISignupState => {
  return current
}
