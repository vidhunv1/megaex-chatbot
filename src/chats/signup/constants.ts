import { FiatCurrency } from '../../constants/currencies'

export enum SIGNUP_CONTEXT {
  GetStarted = 'signup.get-started'
}

export interface SignupContextValues {
  [SIGNUP_CONTEXT.GetStarted]: {
    isTermsAccepted: boolean
    fiatCurrency: FiatCurrency
  }
}

// TODO: Placeholder, fill with real requirements
export interface AccountContextValues {}

//   export const ACCOUNT_KEY_EXPIRY: Record<ACCOUNT_CONTEXTS, number> = {
//     [ACCOUNT_CONTEXTS.SendMessage]: 0,
//     [ACCOUNT_CONTEXTS.AddPaymethod]: 0
//   }
