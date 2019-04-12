export enum CallbackTypes {
  PAYMENT_METHODS = 'account.payment-methods',
  REFERRAL_LINK = 'account.referral-link'
}

export interface DefaultParams {
  messageId: number // The message_id where the callback button is.
}

export interface CallbackParams {
  [CallbackTypes.PAYMENT_METHODS]: {} & DefaultParams
  [CallbackTypes.REFERRAL_LINK]: {} & DefaultParams
}
