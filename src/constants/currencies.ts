import btcRPC, { BtcCommands } from 'core/crypto/btcRpc'
import logger from 'modules/logger'
import { CONFIG } from '../config'

export enum CryptoCurrency {
  BTC = 'BTC',
  ETH = 'ETH'
}

const getFee = async (): Promise<number> => {
  try {
    const btcResult = await btcRPC.btcRpcCall<BtcCommands.ESTIMATE_SMART_FEE>(
      BtcCommands.ESTIMATE_SMART_FEE,
      [6, 'ECONOMICAL']
    )
    if (!btcResult.result.errors && !btcResult.error) {
      return btcResult.result.feerate
    }

    return +CONFIG.BTC_FEES
  } catch (e) {
    logger.error('BTC core HTTP error, estimate smart fee')
    throw e
  }
}

export const cryptoCurrencyInfo: Record<
  CryptoCurrency,
  {
    confirmations: number
    getFee: () => Promise<number>
    minWithdrawalAmount: number
    minBuyAmount: number
    getTxUrl: (txid: string) => string
    precision: number
  }
> = {
  [CryptoCurrency.BTC]: {
    confirmations: 1,
    getFee: getFee,
    minWithdrawalAmount: 0.0005,
    minBuyAmount: 0.00025,
    precision: 8,
    getTxUrl: (txid: string) => `https://live.blockcypher.com/btc/tx/${txid}/`
  },
  [CryptoCurrency.ETH]: {
    confirmations: 12,
    getFee: async () => 0.001,
    minBuyAmount: 0.005,
    minWithdrawalAmount: 0.05,
    precision: 8,
    getTxUrl: (txid: string) => `https://etherscan.io/tx/${txid}`
  }
}

export enum FiatCurrency {
  RUB = 'RUB',
  NGN = 'NGN',
  INR = 'INR',
  CNY = 'CNY',
  GBP = 'GBP',
  USD = 'USD',
  VEF = 'VEF',
  EUR = 'EUR',
  COP = 'COP',
  ZAR = 'ZAR',
  SEK = 'SEK',
  SGD = 'SGD',
  THB = 'THB',
  HKD = 'HKD',
  AUD = 'AUD',
  UAH = 'UAH',
  MYR = 'MYR',
  PEN = 'PEN',
  CAD = 'CAD',
  MXN = 'MXN',
  BRL = 'BRL',
  PAB = 'PAB',
  CLP = 'CLP',
  PKR = 'PKR',
  KES = 'KES',
  NZD = 'NZD',
  SAR = 'SAR',
  PHP = 'PHP',
  VND = 'VND',
  AED = 'AED',
  ARS = 'ARS',
  RON = 'RON',
  IRR = 'IRR',
  BYN = 'BYN',
  KZT = 'KZT',
  TRY = 'TRY',
  NOK = 'NOK',
  DOP = 'DOP',
  MAD = 'MAD',
  GHS = 'GHS',
  PLN = 'PLN',
  CRC = 'CRC',
  UGX = 'UGX',
  TZS = 'TZS',
  LKR = 'LKR',
  KRW = 'KRW',
  HRK = 'HRK',
  JPY = 'JPY'
}

export const CurrencySymbol: Record<FiatCurrency, string | null> = {
  [FiatCurrency.RUB]: '₽',
  [FiatCurrency.NGN]: '₦',
  [FiatCurrency.INR]: '₹',
  [FiatCurrency.CNY]: '¥',
  [FiatCurrency.USD]: '$',
  [FiatCurrency.GBP]: '£',
  [FiatCurrency.VEF]: null,
  [FiatCurrency.EUR]: '€',
  [FiatCurrency.COP]: null,
  [FiatCurrency.ZAR]: null,
  [FiatCurrency.SEK]: null,
  [FiatCurrency.SGD]: null,
  [FiatCurrency.THB]: null,
  [FiatCurrency.HKD]: null,
  [FiatCurrency.AUD]: null,
  [FiatCurrency.UAH]: null,
  [FiatCurrency.MYR]: null,
  [FiatCurrency.PEN]: null,
  [FiatCurrency.CAD]: null,
  [FiatCurrency.MXN]: null,
  [FiatCurrency.BRL]: null,
  [FiatCurrency.PAB]: null,
  [FiatCurrency.CLP]: null,
  [FiatCurrency.PKR]: null,
  [FiatCurrency.KES]: null,
  [FiatCurrency.NZD]: null,
  [FiatCurrency.SAR]: null,
  [FiatCurrency.PHP]: null,
  [FiatCurrency.VND]: '₫',
  [FiatCurrency.AED]: null,
  [FiatCurrency.ARS]: null,
  [FiatCurrency.RON]: null,
  [FiatCurrency.IRR]: null,
  [FiatCurrency.BYN]: null,
  [FiatCurrency.KZT]: null,
  [FiatCurrency.TRY]: null,
  [FiatCurrency.NOK]: null,
  [FiatCurrency.DOP]: null,
  [FiatCurrency.MAD]: null,
  [FiatCurrency.GHS]: null,
  [FiatCurrency.PLN]: null,
  [FiatCurrency.CRC]: null,
  [FiatCurrency.UGX]: null,
  [FiatCurrency.TZS]: null,
  [FiatCurrency.LKR]: null,
  [FiatCurrency.KRW]: '₩',
  [FiatCurrency.HRK]: null,
  [FiatCurrency.JPY]: '¥'
}
