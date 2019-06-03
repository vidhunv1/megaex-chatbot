import { CONFIG } from '../config'

export enum CryptoCurrency {
  BTC = 'BTC'
}

export const cryptoCurrencyInfo: Record<
  CryptoCurrency,
  {
    confirmations: number
    fee: number
    minWithdrawalAmount: number
    minBuyAmount: number
    getTxUrl: (txid: string) => string
  }
> = {
  [CryptoCurrency.BTC]: {
    confirmations: 1,
    fee: parseFloat(CONFIG.BTC_FEES),
    minWithdrawalAmount: 0.002,
    minBuyAmount: 0.00025,
    getTxUrl: (txid: string) => `https://live.blockcypher.com/btc/tx/${txid}/`
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
