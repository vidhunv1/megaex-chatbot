import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  ForeignKey,
  DataType,
  BelongsTo
} from 'sequelize-typescript'
import * as moment from 'moment'
import User from './User'
import Order from './Order'
import Transaction from './Transaction'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import { cacheConnection } from 'modules'
import { CONFIG } from '../config'

export enum TradeStatus {
  INITIATED = 'INITIATED',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',

  PAYMENT_MARKED = 'PAYMENT_MARKED',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE'
}

export const activeTradeStatus: Record<TradeStatus, boolean> = {
  [TradeStatus.INITIATED]: true,
  [TradeStatus.ACCEPTED]: true,
  [TradeStatus.PAYMENT_MARKED]: true,
  [TradeStatus.PAYMENT_DISPUTE]: true,

  [TradeStatus.EXPIRED]: false,
  [TradeStatus.CANCELED]: false,
  [TradeStatus.REJECTED]: false,
  [TradeStatus.PAYMENT_RELEASED]: false
}

export enum TradeErrorTypes {
  TRADE_EXISTS_ON_ORDER = 409
}

@Table({ timestamps: true, tableName: 'Trades', paranoid: true })
export class Trade extends Model<Trade> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  openedByUserId!: number

  @AllowNull(true)
  @ForeignKey(() => Transaction)
  @Column(DataType.BIGINT)
  blockedTransactionId!: number

  @AllowNull(false)
  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  orderId!: number

  @BelongsTo(() => Order)
  order!: Order

  @AllowNull(false)
  @Column(DataType.FLOAT)
  cryptoAmount!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  fixedRate!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  status!: TradeStatus

  static getActiveStatuses(): TradeStatus[] {
    return Object.keys(TradeStatus).filter(
      (ts) => activeTradeStatus[ts as TradeStatus] === true
    ) as TradeStatus[]
  }

  static async initiateTrade(
    openedByUserId: number,
    orderId: number,
    cryptoAmount: number,
    fixedRate: number
  ): Promise<Trade> {
    const t = await Trade.findOne({
      where: {
        openedByUserId,
        orderId,
        status: Trade.getActiveStatuses()
      }
    })

    if (
      t &&
      moment().diff(t.createdAt, 'seconds') <=
        parseInt(CONFIG.DEAL_INIT_TIMEOUT_S)
    ) {
      throw new TradeError(TradeError.TRADE_EXISTS_ON_ORDER)
    }

    const order = await Order.findById(orderId)
    if (!order || (order && cryptoAmount * fixedRate < order.minFiatAmount)) {
      throw new Error('Invalid order')
    }
    const trade = await Trade.create<Trade>({
      openedByUserId,
      orderId,
      cryptoAmount: cryptoAmount,
      fixedRate,
      status: TradeStatus.INITIATED
    })

    const tradeExpiryKey = CacheHelper.getKeyForId(
      CacheKey.TradeInitExpiry,
      trade.id
    )
    await cacheConnection.getClient.setAsync(
      tradeExpiryKey,
      '',
      'EX',
      parseInt(CONFIG.DEAL_INIT_TIMEOUT_S)
    )

    return trade
  }

  static async acceptTrade(tradeId: number): Promise<Trade> {
    const trade = await Trade.findById(tradeId, {
      include: [{ model: Order }]
    })
    if (!trade || !trade.order) {
      throw new TradeError(TradeError.NOT_FOUND)
    }

    const tx = await Transaction.blockBalance(
      trade.order.userId,
      trade.order.cryptoCurrencyCode,
      trade.cryptoAmount,
      trade.id + ''
    )
    if (tx) {
      return await trade.update({
        status: TradeStatus.ACCEPTED,
        blockedTransactionId: tx.id
      })
    } else {
      throw new Error('Error blocking the balance')
    }
  }

  static async releasePayment(tradeId: number): Promise<Trade> {
    const trade = await Trade.findById(tradeId, {
      include: [{ model: Order }]
    })

    if (!trade || !trade.order) {
      throw new Error('Trade / Order now found')
    }

    if (!trade.blockedTransactionId) {
      throw new Error('No blocked amount here')
    }

    const tx = await Transaction.releaseBlockedTx(
      trade.blockedTransactionId,
      trade.openedByUserId
    )
    if (tx) {
      const t = await trade.update({
        status: TradeStatus.PAYMENT_RELEASED
      })

      return t
    } else {
      throw new Error('Error unblocking transaction / no blocked amount found')
    }
  }

  static async setExpired(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      include: [{ model: Order }],
      where: {
        status: TradeStatus.INITIATED,
        id: tradeId
      }
    })

    if (trade) {
      return await trade.update({
        status: TradeStatus.EXPIRED
      })
    }

    return null
  }

  static async setCanceled(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      include: [{ model: Order }],
      where: {
        status: [TradeStatus.INITIATED, TradeStatus.ACCEPTED],
        id: tradeId
      }
    })

    if (trade) {
      console.log('TRADE TO CANCEL: ' + trade.status)
      const tt = await trade.update({
        status: TradeStatus.CANCELED
      })

      const tradeExpiryKey = CacheHelper.getKeyForId(
        CacheKey.TradeInitExpiry,
        trade.id
      )
      await cacheConnection.getClient.delAsync(tradeExpiryKey)

      return tt
    }

    return null
  }
}

export class TradeError extends Error {
  public status: number
  public static TRADE_EXISTS_ON_ORDER = 409
  public static NOT_FOUND = 404
  public static TRADE_EXPIRED = 400

  constructor(
    status: TradeErrorTypes = 500,
    message: string = 'Transaction Error'
  ) {
    super(message)
    this.name = this.constructor.name
    this.status = status
  }
}

export default Trade
