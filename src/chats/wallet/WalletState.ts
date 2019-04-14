import { State, StateFlow } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { CallbackParams } from './constants'

export const WALLET_STATE_KEY = 'wallet'

export interface IWalletState {
  start?: boolean
  wallet?: boolean
  sendCoinAmount?: {
    cryptoCurrencyAmount: number
    cryptoCurrency: CryptoCurrency
    fiatValue: number
    fiatCurrency: FiatCurrency
  }
  insufficientSendAmount?: boolean
  paymentLinkConfirm?: boolean
  paymentLink?: string

  // callbacks
  sendCoin?: CallbackParams['wallet.send-currency']
  widthdraw?: CallbackParams['wallet.withdraw']
  deposit?: CallbackParams['wallet.deposit']
}

export interface WalletState extends State<IWalletState>, IWalletState {}

export const exchangeFlow: StateFlow<IWalletState> = {
  start: 'wallet',
  wallet: null,
  // @ts-ignore
  sendCoinAmount: 'paymentLinkConfirm' | 'isufficientSendAmount',
  paymentLinkConfirm: 'paymentLink',
  paymentLink: null,
  insufficientSendAmount: null,

  // Callbacks
  sendCoin: 'sendCoinAmount',
  widthdraw: null,
  deposit: null
}

export const initialState: WalletState = {
  currentMessageKey: 'start',
  key: WALLET_STATE_KEY
}

export async function nextWalletState(
  currentState: WalletState,
  telegramId: number,
  nextStateOverride?: keyof WalletState | null
): Promise<WalletState | null> {
  return await moveToNextState<WalletState>(
    currentState,
    exchangeFlow,
    telegramId,
    undefined,
    // @ts-ignore
    nextStateOverride
  )
}
