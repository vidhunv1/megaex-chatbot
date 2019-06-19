import { FiatCurrency } from './currencies'
import { PaymentMethodType } from 'models/PaymentMethod'

export const PaymentMethodAvailability: Record<
  PaymentMethodType,
  FiatCurrency | 'ALL'
> = {
  [PaymentMethodType.PAYTM]: FiatCurrency.INR,
  [PaymentMethodType.UPI]: FiatCurrency.INR,
  [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: FiatCurrency.INR,

  // RUB
  [PaymentMethodType.SBERBANK]: FiatCurrency.RUB,
  [PaymentMethodType.QIWI]: FiatCurrency.RUB,
  [PaymentMethodType.YANDEX_MONEY]: FiatCurrency.RUB,

  // CNY
  [PaymentMethodType.ALIPAY]: FiatCurrency.CNY,
  [PaymentMethodType.WECHAT]: FiatCurrency.CNY,

  // ALL
  [PaymentMethodType.CASH_TRADE]: 'ALL',
  [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'ALL',
  [PaymentMethodType.PAYPAL]: 'ALL',
  [PaymentMethodType.CASH_DEPOSIT]: 'ALL',
  [PaymentMethodType.CREDIT_CARD]: 'ALL',
  [PaymentMethodType.SKRILL]: 'ALL',
  [PaymentMethodType.OKPAY]: 'ALL',
  [PaymentMethodType.WESTERN_UNION]: 'ALL',
  [PaymentMethodType.WEBMONEY]: 'ALL',
  [PaymentMethodType.NETTELLER]: 'ALL',
  [PaymentMethodType.INTERNATIONAL_WIRE]: 'ALL',
  [PaymentMethodType.AMAZON_GIFT_CARD]: 'ALL',
  [PaymentMethodType.PAXUM]: 'ALL',
  [PaymentMethodType.PAYONEER]: 'ALL',
  [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 'ALL',
  [PaymentMethodType.OTHER]: 'ALL'
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
  ],

  [PaymentMethodType.SBERBANK]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.QIWI]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.YANDEX_MONEY]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.ALIPAY]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.WECHAT]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.NATIONAL_BANK_TRANSFER]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`,
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.PAYPAL]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.CASH_TRADE]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.CASH_DEPOSIT]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.CREDIT_CARD]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.SKRILL]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.OKPAY]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.WESTERN_UNION]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.WEBMONEY]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.NETTELLER]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.INTERNATIONAL_WIRE]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.AMAZON_GIFT_CARD]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.PAXUM]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.PAYONEER]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ],
  [PaymentMethodType.OTHER_CRYPTOCURRENCY]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`,
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field2`
  ],
  [PaymentMethodType.OTHER]: [
    `${pmFieldsLocaleBase}.${PaymentMethodType.PAYTM}.field1`
  ]
}

export const PaymentMethodPrimaryFieldIndex: Record<
  PaymentMethodType,
  number
> = {
  [PaymentMethodType.PAYTM]: 0,
  [PaymentMethodType.UPI]: 0,
  [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 1,

  [PaymentMethodType.SBERBANK]: 0,
  [PaymentMethodType.QIWI]: 0,
  [PaymentMethodType.YANDEX_MONEY]: 0,

  // CNY
  [PaymentMethodType.ALIPAY]: 0,
  [PaymentMethodType.WECHAT]: 0,

  // ALL
  [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 1,
  [PaymentMethodType.PAYPAL]: 0,
  [PaymentMethodType.CASH_TRADE]: 0,
  [PaymentMethodType.CASH_DEPOSIT]: 0,
  [PaymentMethodType.CREDIT_CARD]: 0,
  [PaymentMethodType.SKRILL]: 0,
  [PaymentMethodType.OKPAY]: 0,
  [PaymentMethodType.WESTERN_UNION]: 0,
  [PaymentMethodType.WEBMONEY]: 0,
  [PaymentMethodType.NETTELLER]: 0,
  [PaymentMethodType.INTERNATIONAL_WIRE]: 0,
  [PaymentMethodType.AMAZON_GIFT_CARD]: 0,
  [PaymentMethodType.PAXUM]: 0,
  [PaymentMethodType.PAYONEER]: 0,
  [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 0,
  [PaymentMethodType.OTHER]: 0
}

export const getAllPaymentMethods = (
  currencyCode: FiatCurrency
): PaymentMethodType[] =>
  // @ts-ignore
  Object.keys(PaymentMethodAvailability).filter(
    (key) =>
      // @ts-ignore
      PaymentMethodAvailability[key] === currencyCode ||
      // @ts-ignore
      PaymentMethodAvailability[key] === 'ALL'
  )
