import { FiatCurrency } from './currencies'

export enum PaymentMethods {
  PAYTM = 'PAYTM',
  UPI = 'UPI',
  BANK_TRANSFER_IMPS_INR = 'BANK_TRANSFER_IMPS_INR',
  CASH = 'CASH'
}

export const PaymentMethodAvailability: Record<
  PaymentMethods,
  FiatCurrency | 'ALL'
> = {
  [PaymentMethods.PAYTM]: FiatCurrency.INR,
  [PaymentMethods.UPI]: FiatCurrency.INR,
  [PaymentMethods.BANK_TRANSFER_IMPS_INR]: FiatCurrency.INR,
  [PaymentMethods.CASH]: 'ALL'
}

export enum PMFields {
  FIELD1 = 'FIELD1',
  FIELD2 = 'FIELD2',
  FIELD3 = 'FIELD3'
}

const pmFieldsLocaleBase = 'payment-methods.fields'
export const PaymentMethodsFieldsLocale: Record<PaymentMethods, string[]> = {
  [PaymentMethods.PAYTM]: [
    `${pmFieldsLocaleBase}.${PaymentMethods.PAYTM}.field1`
  ],
  [PaymentMethods.UPI]: [`${pmFieldsLocaleBase}.${PaymentMethods.UPI}.field1`],
  [PaymentMethods.BANK_TRANSFER_IMPS_INR]: [
    `${pmFieldsLocaleBase}.${PaymentMethods.BANK_TRANSFER_IMPS_INR}.field1`,
    `${pmFieldsLocaleBase}.${PaymentMethods.BANK_TRANSFER_IMPS_INR}.field2`,
    `${pmFieldsLocaleBase}.${PaymentMethods.BANK_TRANSFER_IMPS_INR}.field3`
  ],
  [PaymentMethods.CASH]: [`${pmFieldsLocaleBase}.${PaymentMethods.CASH}.field1`]
}

export const PaymentMethodPrimaryFieldIndex: Record<PaymentMethods, number> = {
  [PaymentMethods.PAYTM]: 0,
  [PaymentMethods.UPI]: 0,
  [PaymentMethods.BANK_TRANSFER_IMPS_INR]: 1,
  [PaymentMethods.CASH]: 0
}
