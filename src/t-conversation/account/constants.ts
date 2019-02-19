export enum ACCOUNT_CONTEXTS {
  SendMessage = 'send-message',
  AddPaymethod = 'add-paymethod'
}

// TODO: Placeholder, fill with real requirements
export interface AccountContextValues {
  [ACCOUNT_CONTEXTS.SendMessage]: {
    userId: string
    message: string
  }
  [ACCOUNT_CONTEXTS.AddPaymethod]: {
    paymentMethod: string
  }
}

export const ACCOUNT_KEY_EXPIRY: Record<ACCOUNT_CONTEXTS, number> = {
  [ACCOUNT_CONTEXTS.SendMessage]: 0,
  [ACCOUNT_CONTEXTS.AddPaymethod]: 0
}
