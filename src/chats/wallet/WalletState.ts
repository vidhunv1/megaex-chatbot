import { State, StateFlow } from 'chats/types'
import { moveToNextState } from 'chats/utils'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { CallbackParams } from './constants'

export const WALLET_STATE_KEY = 'wallet'

export interface IWalletState {
  start?: boolean
  wallet?: boolean

  // Send coin
  sendCoinAmount?: {
    cryptoCurrencyAmount: number
    cryptoCurrency: CryptoCurrency
    fiatValue: number
    fiatCurrency: FiatCurrency
  }
  insufficientSendAmount?: boolean
  paymentLinkConfirm?: boolean
  paymentLink?: string

  // Deposit
  showDepositAddress?: {
    currencyCode: CryptoCurrency
    address: string
  }

  // withdraw
  withdrawCoinAmount?: {
    cryptoCurrencyAmount: number
    cryptoCurrency: CryptoCurrency
    fiatValue: number
    fiatCurrency: FiatCurrency
  }
  withdrawAddress?: string
  insufficientWithdrawAmount?: boolean
  withdrawConfirm?: boolean
  showWithdrawSuccess?: string
  showWithdrawError?: string
  invalidWithdrawAddress?: string

  // callbacks
  sendCoin?: CallbackParams['wallet.send-currency']
  withdraw?: CallbackParams['wallet.withdraw']
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

  // @ts-ignore
  withdrawCoinAmount: 'withdrawAddress' | 'insufficientWithdrawAmount',
  // @ts-ignore
  withdrawAddress: 'invalidWithdrawAddress' | 'withdrawConfirm',
  // @ts-ignore
  withdrawConfirm: 'showWithdrawSuccess' | 'showWithdrawError',
  insufficientWithdrawAmount: null,
  showWithdrawSuccess: null,
  showWithdrawError: null,

  // Callbacks
  sendCoin: 'sendCoinAmount',
  deposit: 'showDepositAddress',
  withdraw: 'withdrawCoinAmount'
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
