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
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import PaymentMethod, { PaymentMethodType } from './PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { logger } from 'modules'
import * as _ from 'lodash'
import { Transaction, Market } from 'models'

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
}

export enum RateType {
  MARGIN = 'MARGIN',
  FIXED = 'FIXED'
}

@Table({ timestamps: true, tableName: 'Orders', paranoid: true })
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
  minFiatAmount!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  maxFiatAmount!: number

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
    minFiatAmount: number,
    maxFiatAmount: number,
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
      minFiatAmount,
      maxFiatAmount,
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

  static async getAllOrders(orderType: OrderType, fiatCode: FiatCurrency) {
    return await Order.findAll({
      where: {
        orderType,
        fiatCurrencyCode: fiatCode
      }
    })
  }

  static async getOrder(orderId: number) {
    return await Order.findOne({
      where: {
        id: orderId
      },
      include: [{ model: User }]
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

  static async getQuickDealList(orderType: OrderType, fiatCode: FiatCurrency) {
    const orders = await Order.findAll({
      where: {
        orderType,
        fiatCurrencyCode: fiatCode
      },
      include: [{ model: User }]
    })

    logger.error('TODO: Order: Implement correct values')

    const ordersList = []
    for (let i = 0; i < orders.length; i++) {
      const iOrder = orders[i]
      const fixedRate = await Order.convertToFixedRate(
        iOrder.rate,
        iOrder.rateType,
        iOrder.cryptoCurrencyCode,
        iOrder.fiatCurrencyCode,
        iOrder.user.exchangeRateSource
      )

      logger.error('TODO: models/order connect rating')
      // TODO: Getting balance for buy orders might be unnecessary
      ordersList.push({
        id: iOrder.id,
        minFiatAmount: iOrder.minFiatAmount,
        paymentMethodType: iOrder.paymentMethodType,
        fiatCurrencyCode: iOrder.fiatCurrencyCode,
        orderType: iOrder.orderType,
        rating: 4.5,
        availableFiatBalance:
          (await Transaction.getAvailableBalance(
            iOrder.userId,
            iOrder.cryptoCurrencyCode
          )) * fixedRate,
        fixedRate
      })
    }

    return ordersList
  }

  static async convertToFixedRate(
    rate: number,
    rateType: RateType,
    cryptoCurrency: CryptoCurrency,
    fiatCode: FiatCurrency,
    exchangeSource: ExchangeSource
  ) {
    if (rateType === RateType.FIXED) {
      return rate
    }

    const market = await getMarketRate(cryptoCurrency, fiatCode, exchangeSource)
    return market + (market * rate) / 100
  }
}

async function getMarketRate(
  cryptoCurrencyCode: CryptoCurrency,
  fiatCurrency: FiatCurrency,
  exchangeRateSource: ExchangeSource
) {
  return await Market.getFiatValue(
    cryptoCurrencyCode,
    fiatCurrency,
    exchangeRateSource
  )
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
