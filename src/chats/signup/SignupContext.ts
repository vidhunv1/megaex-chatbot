import { Language } from '../../constants/languages'
import { FiatCurrency } from '../../constants/currencies'
import { State, StateFlow } from '../types'

interface Signup {
  language?: Language
  welcome?: boolean
  termsAndConditions?: boolean
  fiatCurrency?: FiatCurrency
  accountReady?: boolean
}

export interface SignupState extends State<Signup>, Signup {}

// export const InitialState: keyof Signup = 'language'

export const SignupFlow: StateFlow<Signup> = {
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
