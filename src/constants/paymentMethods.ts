import { FiatCurrency } from './currencies'
import { PaymentMethodType } from 'models/PaymentMethod'

export const PaymentMethodAvailability: Record<
  PaymentMethodType,
  FiatCurrency | 'ALL'
> = {
  [PaymentMethodType.PAYTM]: FiatCurrency.INR,
  [PaymentMethodType.UPI]: FiatCurrency.INR,
  [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: FiatCurrency.INR
}

export enum PMFields {
  FIELD1 = 'FIELD1',
  FIELD2 = 'FIELD2',
  FIELD3 = 'FIELD3'
}

const pmFieldsLocaleBase = 'payment-methods.fields'
export const PaymentMethodsFieldsLocale: Record<PaymentMethodType, string[]> = {
  [PaymentMethodType.PAYTM]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.UPI]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.UPI}.field1`
  ],
  [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.BANK_TRANSFER_IMPS_INR}.field1`,
    `${pmFieldsLocaleBase}.${PaymentMethodType.BANK_TRANSFER_IMPS_INR}.field2`,
    `${pmFieldsLocaleBase}.${PaymentMethodType.BANK_TRANSFER_IMPS_INR}.field3`
  ]
}

export const PaymentMethodPrimaryFieldIndex: Record<
  PaymentMethodType,
  number
> = {
  [PaymentMethodType.PAYTM]: 0,
  [PaymentMethodType.UPI]: 0,
  [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 1
}
