export enum CallbackTypes {
  SEND_CURRENCY = 'wallet.send-currency',
  MY_ADDRESS = 'wallet.my-address',
  WITHDRAW = 'wallet.withdraw'
}

export interface DefaultParams {
  messageId: number // The message_id where the callback button is.
}

export interface CallbackParams {
  [CallbackTypes.MY_ADDRESS]: {} & DefaultParams
  [CallbackTypes.SEND_CURRENCY]: {} & DefaultParams
  [CallbackTypes.WITHDRAW]: {} & DefaultParams
}
