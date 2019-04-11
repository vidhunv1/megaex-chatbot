export enum CallbackTypes {
  MY_ORDERS = 'exchange.my-orders',
  CREATE_ORDER = 'exchange.create-order',
  BUY = 'exchange.buy',
  SELL = 'exchange.sell'
}

export interface DefaultParams {
  messageId: number // The message_id where the callback button is.
}

export interface CallbackParams {
  [CallbackTypes.BUY]: {} & DefaultParams
  [CallbackTypes.SELL]: {} & DefaultParams
  [CallbackTypes.CREATE_ORDER]: {} & DefaultParams
  [CallbackTypes.MY_ORDERS]: {} & DefaultParams
}
