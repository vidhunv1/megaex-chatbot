import { IWalletState } from './WalletState'
import { CryptoCurrency } from 'constants/currencies'

export enum CallbackTypes {
  SEND_CURRENCY = 'wallet.send-currency',
  DEPOSIT = 'wallet.deposit',
  WITHDRAW = 'wallet.withdraw'
}

export interface DefaultParams {
  messageId: number // The message_id where the callback button is.
}

export interface CallbackParams {
  [CallbackTypes.DEPOSIT]: {} & DefaultParams
  [CallbackTypes.SEND_CURRENCY]: {
    currencyCode: CryptoCurrency
  } & DefaultParams
  [CallbackTypes.WITHDRAW]: {
    currencyCode: CryptoCurrency
  } & DefaultParams
}

export const callbackStateMap: Record<CallbackTypes, keyof IWalletState> = {
  [CallbackTypes.SEND_CURRENCY]: 'sendCoin',
  [CallbackTypes.DEPOSIT]: 'deposit',
  [CallbackTypes.WITHDRAW]: 'withdraw'
}
