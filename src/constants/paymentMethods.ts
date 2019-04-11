import { FiatCurrency } from './currencies'

export enum PaymentMethods {
  PAYTM = 'PAYTM',
  UPI = 'UPI',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH'
}

export const PaymentAvailability: Record<
  PaymentMethods,
  FiatCurrency | 'ALL'
> = {
  [PaymentMethods.PAYTM]: FiatCurrency.INR,
  [PaymentMethods.UPI]: FiatCurrency.INR,
  [PaymentMethods.BANK_TRANSFER]: 'ALL',
  [PaymentMethods.CASH]: 'ALL'
}
