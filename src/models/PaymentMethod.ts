import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  ForeignKey,
  DataType,
  BelongsTo,
  Default
} from 'sequelize-typescript'
import { User } from '.'

export type PaymentMethodFields = {
  id: number
  paymentMethod: PaymentMethodType
  fields: string[]
}

export enum PaymentMethodType {
  // INR
  PAYTM = 'PAYTM',
  UPI = 'UPI',
  BANK_TRANSFER_IMPS_INR = 'BANK_TRANSFER_IMPS_INR',

  // RUB
  SBERBANK = 'SBERBANK',
  QIWI = 'QIWI',
  YANDEX_MONEY = 'YANDEX_MONEY',

  // CNY
  ALIPAY = 'ALIPAY',
  WECHAT = 'WECHAT',

  // ALL
  CASH_TRADE = 'CASH_TRADE',
  NATIONAL_BANK_TRANSFER = 'NATIONAL_BANK_TRANSFER',
  PAYPAL = 'PAYPAL',
  CASH_DEPOSIT = 'CASH_DEPOSIT',
  CREDIT_CARD = 'CREDIT_CARD',
  SKRILL = 'SKRILL',
  OKPAY = 'OKPAY',
  WESTERN_UNION = 'WESTERN_UNION',
  WEBMONEY = 'WEBMONEY',
  NETTELLER = 'NETTELLER',
  INTERNATIONAL_WIRE = 'INTERNATIONAL_WIRE',
  AMAZON_GIFT_CARD = 'AMAZON_GIFT_CARD',
  PAXUM = 'PAXUM',
  PAYONEER = 'PAYONEER',
  OTHER_CRYPTOCURRENCY = 'OTHER CRYPTOCURRENCY',
  OTHER = 'OTHER'
}

@Table({ timestamps: true, tableName: 'PaymentMethods', paranoid: true })
export class PaymentMethod extends Model<PaymentMethod> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User

  @AllowNull(false)
  @Column(DataType.STRING)
  paymentMethod!: PaymentMethodType

  @AllowNull(false)
  @Default('[]')
  @Column(DataType.STRING)
  fields!: string

  static async savePaymentMethod(
    userId: number,
    paymentMethod: PaymentMethodType,
    fields: string[]
  ): Promise<number> {
    const pm = await PaymentMethod.create<PaymentMethod>(
      {
        userId,
        paymentMethod,
        fields: JSON.stringify(fields)
      },
      {}
    )

    return pm.id
  }

  static async editPaymentMethod(
    id: number,
    userId: number,
    paymentMethod: PaymentMethodType,
    fields: string[]
  ): Promise<number> {
    await PaymentMethod.destroy({
      where: {
        id
      }
    })
    return await PaymentMethod.savePaymentMethod(userId, paymentMethod, fields)
  }

  static async getSavedPaymentMethods(
    userId: number
  ): Promise<PaymentMethodFields[]> {
    // TODO: Maybe show only payment methods for the currency
    const pms = await PaymentMethod.findAll<PaymentMethod>({
      where: {
        userId
      }
    })

    return pms.map((pm) => ({
      id: pm.id,
      paymentMethod: pm.paymentMethod,
      fields: JSON.parse(pm.fields) as string[]
    }))
  }

  static async getPaymentMethod(pmId: number) {
    const pm = await PaymentMethod.findOne({
      where: {
        id: pmId
      }
    })

    if (!pm) {
      return null
    }

    return {
      id: pm.id,
      paymentMethod: pm.paymentMethod,
      fields: JSON.parse(pm.fields) as string[]
    }
  }
}

export default PaymentMethod
