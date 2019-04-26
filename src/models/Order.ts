import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  Default,
  Sequelize
} from 'sequelize-typescript'
import { User, Transaction, Wallet } from '.'
import logger from '../modules/Logger'

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL'
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

  @AllowNull(true)
  @Column(DataType.FLOAT)
  minAmount!: number | null

  @AllowNull(false)
  @Column(DataType.FLOAT)
  maxAmount!: number

  @AllowNull(true)
  @Column(DataType.FLOAT)
  price!: number | null // null values are market price orders

  @AllowNull(true)
  @ForeignKey(() => Order)
  @Column(DataType.INTEGER)
  matchedOrderId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: OrderType

  @AllowNull(false)
  @Column(DataType.STRING)
  status!: 'active' | 'matched' | 'accepted' | 'completed' | 'stopped'

  @AllowNull(false)
  @Column(DataType.STRING)
  currencyCode!: string

  @AllowNull(true)
  @Column(DataType.STRING)
  paymentMethodFilters!: string

  @AllowNull(true)
  @Default(0.0)
  @Column(DataType.FLOAT)
  marginPercentage!: number

  @AllowNull(true)
  @Column(DataType.BOOLEAN)
  accountVerifiedFilter!: boolean

  @AllowNull(true)
  @Column(DataType.DATE)
  confirmedTime!: Date

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  cancelCount!: number

  async createSellOrder(
    userId: number,
    minAmount: number | null,
    maxAmount: number,
    price: number | null,
    margin: number | null = 0.0,
    currencyCode: string = 'btc'
  ): Promise<Order> {
    // check if balance available
    const balance = await Transaction.getTotalBalance(userId, currencyCode)
    let marginPercentage: number = 0
    if (maxAmount > balance) {
      throw new OrderError(OrderError.INSUFFICIENT_BALANCE)
    }
    if (minAmount && minAmount < 0) {
      throw new OrderError(OrderError.INVALID_PARAMS)
    }
    if (!price) {
      price = null
      marginPercentage = margin || 0
    }

    return await this.sequelize.transaction(async function(t) {
      // block balance
      try {
        await Wallet.blockBalance(userId, currencyCode, maxAmount, t)
      } catch (e) {
        throw new OrderError()
      }
      const order = await Order.create<Order>(
        {
          price,
          marginPercentage,
          minAmount,
          maxAmount,
          userId,
          status: 'active',
          type: OrderType.SELL,
          currencyCode
        },
        { transaction: t }
      )
      return order
    })
  }

  async createBuyOrder(
    userId: number,
    minAmount: number | null,
    maxAmount: number,
    price: number | null,
    currencyCode: string = 'btc'
  ): Promise<Order> {
    const order = await Order.create<Order>(
      {
        userId,
        minAmount,
        maxAmount,
        status: 'active',
        type: OrderType.BUY,
        currencyCode,
        price
      },
      {}
    )
    return order
  }

  async updateAccountVerifiedFilter(shouldSet: boolean) {
    await this.update({ accountVerifiedFilter: shouldSet })
  }

  async getActiveOrders(userId: number) {
    const activeOrders = await Order.findAll({
      where: { userId: userId, status: { [Sequelize.Op.ne]: 'completed' } }
    })
    console.log('Active orders: ' + JSON.stringify(activeOrders))
  }
}

export class OrderError extends Error {
  public status: number
  public static INSUFFICIENT_BALANCE = 490
  public static INVALID_PARAMS = 400

  constructor(status: number = 500, message: string = 'Transaction Error') {
    super(message)
    this.name = this.constructor.name
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Order
