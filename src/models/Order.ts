import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  AutoIncrement
} from 'sequelize-typescript'
import { User } from '.'
import logger from '../modules/Logger'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import PaymentMethod, { PaymentMethodType } from './PaymentMethod'
import * as _ from 'lodash'
import { ExchangeSource } from 'constants/exchangeSource'

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum RateType {
  MARGIN = 'MARGIN',
  FIXED = 'FIXED'
}

@Table({ timestamps: true, tableName: 'Orders' })
export class Order extends Model<Order> {
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
  orderType!: OrderType

  @AllowNull(false)
  @Column(DataType.FLOAT)
  rate!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  rateType!: RateType

  @AllowNull(false)
  @Column(DataType.FLOAT)
  minAmount!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  maxAmount!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  cryptoCurrencyCode!: CryptoCurrency

  @AllowNull(false)
  @Column(DataType.STRING)
  fiatCurrencyCode!: FiatCurrency

  @AllowNull(false)
  @Column(DataType.STRING)
  paymentMethodType!: PaymentMethodType

  @AllowNull(true)
  @ForeignKey(() => PaymentMethod)
  @Column(DataType.BIGINT)
  paymentMethodId!: number | null

  @AllowNull(true)
  @Column(DataType.STRING)
  terms!: string

  @AllowNull(false)
  @Column(DataType.BOOLEAN)
  isActive!: boolean

  static async createOrder(
    userId: number,
    orderType: OrderType,
    rate: number,
    rateType: RateType,
    minAmount: number,
    maxAmount: number,
    cryptoCurrencyCode: CryptoCurrency,
    fiatCurrencyCode: FiatCurrency,
    paymentMethodType: PaymentMethodType,
    paymentMethodId: number | null
  ): Promise<Order> {
    return await Order.create<Order>({
      userId,
      orderType,
      rate,
      rateType,
      minAmount,
      maxAmount,
      cryptoCurrencyCode,
      fiatCurrencyCode,
      paymentMethodType,
      paymentMethodId,
      isActive: true
    })
  }

  static async editOrder(orderId: number, order: Partial<Order>) {
    await Order.update(_.omit(order, ['id', 'userId']), {
      where: {
        id: orderId
      }
    })
  }

  static async getAllOrders(userId: number) {
    return await Order.findAll({
      where: {
        userId
      }
    })
  }

  static async getOrder(orderId: number) {
    return await Order.findOne({
      where: {
        id: orderId
      }
    })
  }

  static async deleteOrder(orderId: number) {
    logger.error(
      'TODO: SHould delete order only when there is no ongoing trade'
    )
    await Order.destroy({
      where: {
        id: orderId
      }
    })
  }

  static async convertToFixedRate(
    rate: number,
    rateType: RateType,
    fiatCode: FiatCurrency,
    exchangeSource: ExchangeSource
  ) {
    if (rateType === RateType.FIXED) {
      return rate
    }

    const market = await getMarketRate(fiatCode, exchangeSource)
    return market + (market * rate) / 100
  }
}

async function getMarketRate(
  _fiatCode: FiatCurrency,
  _exchangeSource: ExchangeSource
) {
  return 400000
}

export class OrderError extends Error {
  public status: number
  public static INVALID_PARAMS = 400

  constructor(status: number = 500, message: string = 'Order Error') {
    super(message)
    this.name = this.constructor.name
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Order
