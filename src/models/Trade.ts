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
import { OrderType, Order } from './Order'
import Transaction from './Transaction'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import { cacheConnection } from 'modules'
import { CONFIG } from '../config'
import PaymentMethod, { PaymentMethodType } from './PaymentMethod'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import logger from 'modules/logger'
import Dispute, { DisputeStatus } from './Dispute'

export enum TradeStatus {
  INITIATED = 'INITIATED',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',

  PAYMENT_SENT = 'PAYMENT_SENT',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE',

  ESCROW_CLOSED = 'ESCROW_CLOSED'
}

export enum TradeRating {
  VERY_NEGATIVE = 1,
  NEGATIVE = 2,
  POSITIVE = 3,
  VERY_POSITIVE = 4,
  EXCELLENT = 5
}

export const activeTradeStatus: Record<TradeStatus, boolean> = {
  [TradeStatus.INITIATED]: true,
  [TradeStatus.ACCEPTED]: true,
  [TradeStatus.PAYMENT_SENT]: true,
  [TradeStatus.PAYMENT_DISPUTE]: true,

  [TradeStatus.EXPIRED]: false,
  [TradeStatus.CANCELED]: false,
  [TradeStatus.REJECTED]: false,
  [TradeStatus.PAYMENT_RELEASED]: false,

  [TradeStatus.ESCROW_CLOSED]: false
}

export enum TradeErrorTypes {
  TRADE_EXISTS_ON_ORDER = 409
}

@Table({ timestamps: true, tableName: 'Trades', paranoid: true })
export class Trade extends Model<Trade> {
  @BelongsTo(() => Order)
  order!: Order

  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  sellerUserId!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  buyerUserId!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  createdByUserId!: number

  @AllowNull(false)
  @ForeignKey(() => Order)
  @Column(DataType.BIGINT)
  orderId!: number

  @AllowNull(true)
  @ForeignKey(() => Transaction)
  @Column(DataType.BIGINT)
  blockedTransactionId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  status!: TradeStatus

  // Fields copied from Order to fix values.
  @AllowNull(false)
  @Column(DataType.STRING)
  tradeType!: OrderType

  @AllowNull(true)
  @Column(DataType.STRING)
  terms!: string

  @AllowNull(false)
  @Column(DataType.STRING)
  cryptoCurrencyCode!: CryptoCurrency

  @AllowNull(false)
  @Column(DataType.STRING)
  fiatCurrencyCode!: FiatCurrency

  @AllowNull(false)
  @Column(DataType.FLOAT)
  cryptoAmount!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  fiatAmount!: number

  @AllowNull(false)
  @Column(DataType.FLOAT)
  fixedRate!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  paymentMethodType!: PaymentMethodType

  @AllowNull(true)
  @ForeignKey(() => PaymentMethod)
  @Column(DataType.BIGINT)
  paymentMethodId!: number | null

  @AllowNull(true)
  @Column(DataType.INTEGER)
  ratingByBuyer!: TradeRating

  @AllowNull(true)
  @Column(DataType.INTEGER)
  ratingBySeller!: TradeRating

  @AllowNull(true)
  @Column(DataType.STRING)
  reviewByBuyer!: string

  @AllowNull(true)
  @Column(DataType.STRING)
  reviewBySeller!: string

  public static TradeStatus = TradeStatus

  static async giveRating(
    tradeId: number,
    fromUserId: number,
    rating: TradeRating
  ): Promise<Trade | null> {
    const trade = await Trade.findById(tradeId)
    if (!trade || (trade && trade.status != TradeStatus.PAYMENT_RELEASED)) {
      return null
    }

    const updates: Partial<Trade> = {}
    if (fromUserId === trade.sellerUserId) {
      if (trade.ratingBySeller != null) {
        return null
      }

      updates.ratingBySeller = rating
    } else {
      if (trade.ratingByBuyer != null) {
        return null
      }

      updates.ratingByBuyer = rating
    }

    return trade.update(updates)
  }

  static async giveReview(
    tradeId: number,
    fromUserId: number,
    review: string
  ): Promise<Trade | null> {
    const trade = await Trade.findById(tradeId)
    if (!trade || (trade && trade.status != TradeStatus.PAYMENT_RELEASED)) {
      return null
    }

    const updates: Partial<Trade> = {}
    if (fromUserId === trade.sellerUserId) {
      updates.reviewBySeller = review
      if (trade.reviewBySeller != null) {
        return null
      }
    } else {
      updates.reviewByBuyer = review
      if (trade.reviewByBuyer != null) {
        return null
      }
    }

    return await trade.update(updates)
  }

  static async openDispute(
    tradeId: number,
    userId: number
  ): Promise<Trade | null> {
    const trade = await Trade.findById(tradeId)
    if (trade) {
      if (userId !== trade.buyerUserId && userId !== trade.sellerUserId) {
        logger.error('This user cannot open a dispute')
        return null
      }
      if (
        trade.status === TradeStatus.PAYMENT_SENT ||
        trade.status === TradeStatus.ACCEPTED
      ) {
        await Dispute.create<Dispute>({
          openedByUserId: userId,
          tradeId: tradeId,
          status: DisputeStatus.PENDING
        })
        const tt = await trade.update({
          status: TradeStatus.PAYMENT_DISPUTE
        })

        return tt
      } else {
        logger.error('Dispute cannot be opened in this trade state')
        return null
      }
    } else {
      return null
    }
  }

  static getActiveStatuses(): TradeStatus[] {
    return Object.keys(TradeStatus).filter(
      (ts) => activeTradeStatus[ts as TradeStatus] === true
    ) as TradeStatus[]
  }

  static async initiateTrade(
    createdByUserId: number,
    orderId: number,
    cryptoAmount: number,
    fixedRate: number
  ): Promise<Trade> {
    const t = await Trade.findOne({
      where: {
        createdByUserId,
        orderId: orderId,
        status: Trade.getActiveStatuses()
      }
    })

    // Incase for some reason if it was not expired
    const isNotExpired =
      t &&
      t.status === TradeStatus.INITIATED &&
      moment().diff(t.createdAt, 'seconds') <=
        parseInt(CONFIG.TRADE_INIT_TIMEOUT_S)

    if (t || isNotExpired) {
      throw new TradeError(TradeError.TRADE_EXISTS_ON_ORDER)
    }

    const order = await Order.findById(orderId)
    if (!order || (order && cryptoAmount * fixedRate < order.minFiatAmount)) {
      throw new Error(
        'Invalid trade params: (cryptoAmount * fixedRate) < order.minFiatAmount)'
      )
    }

    let sellerUserId, buyerUserId
    if (order.orderType === OrderType.SELL) {
      sellerUserId = order.userId
      buyerUserId = createdByUserId
    } else {
      buyerUserId = order.userId
      sellerUserId = createdByUserId
    }

    const trade = await Trade.create<Trade>({
      sellerUserId,
      buyerUserId,
      orderId: orderId,
      createdByUserId,
      status: TradeStatus.INITIATED,
      tradeType:
        order.orderType === OrderType.BUY ? OrderType.SELL : OrderType.BUY,
      terms: order.terms,
      cryptoCurrencyCode: order.cryptoCurrencyCode,
      fiatCurrencyCode: order.fiatCurrencyCode,
      cryptoAmount: cryptoAmount,
      fiatAmount: fixedRate * cryptoAmount,
      fixedRate,
      paymentMethodType: order.paymentMethodType,
      paymentMethodId: order.paymentMethodId
    })

    const tradeExpiryKey = CacheHelper.getKeyForId(
      CacheKey.TradeInitExpiry,
      trade.id
    )
    await cacheConnection.getClient.setAsync(
      tradeExpiryKey,
      '',
      'EX',
      parseInt(CONFIG.TRADE_INIT_TIMEOUT_S)
    )

    return trade
  }

  static async acceptTrade(tradeId: number): Promise<Trade> {
    const trade = await Trade.find({
      where: {
        id: tradeId,
        status: TradeStatus.INITIATED
      }
    })
    if (!trade) {
      throw new TradeError(TradeError.NOT_FOUND)
    }

    const tx = await Transaction.blockBalance(
      trade.sellerUserId,
      trade.cryptoCurrencyCode,
      trade.cryptoAmount,
      trade.id + ''
    )
    if (tx) {
      const tt = await trade.update({
        status: TradeStatus.ACCEPTED,
        blockedTransactionId: tx.id
      })

      if (tt) {
        Trade.deleteTradeExpiration(trade.id)
      }

      const escrowClosedTimeout = parseInt(CONFIG.TRADE_ESCROW_TIMEOUT_S)
      const escrowWarnTimeout = parseInt(escrowClosedTimeout * 0.33 + '')

      const escrowClosedExpiryKey = CacheHelper.getKeyForId(
        CacheKey.TradeEscrowClosedExpiry,
        trade.id
      )
      const escrowWarnExpiryKey = CacheHelper.getKeyForId(
        CacheKey.TradeEscrowWarnExpiry,
        trade.id
      )

      await cacheConnection.getClient.setAsync(
        escrowWarnExpiryKey,
        '',
        'EX',
        escrowWarnTimeout
      )
      await cacheConnection.getClient.setAsync(
        escrowClosedExpiryKey,
        '',
        'EX',
        escrowClosedTimeout
      )

      return tt
    } else {
      throw new Error('Error blocking the balance')
    }
  }

  static async rejectTrade(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      where: {
        id: tradeId,
        status: TradeStatus.INITIATED
      }
    })
    if (!trade) {
      throw new TradeError(TradeError.NOT_FOUND)
    }

    const tt = await trade.update({
      status: TradeStatus.REJECTED
    })

    if (tt) {
      Trade.deleteTradeExpiration(tt.id)
    }

    return tt
  }

  static async setExpired(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      where: {
        status: TradeStatus.INITIATED,
        id: tradeId
      }
    })

    if (trade) {
      const tt = await trade.update({
        status: TradeStatus.EXPIRED
      })

      if (tt) {
        Trade.deleteTradeExpiration(trade.id)
      }

      return tt
    }

    return null
  }

  static async setCanceled(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      where: {
        status: [TradeStatus.INITIATED, TradeStatus.ACCEPTED],
        id: tradeId
      }
    })

    if (trade) {
      if (trade.status === TradeStatus.ACCEPTED) {
        await Transaction.unblockTx(trade.blockedTransactionId)
      }

      const tt = await trade.update({
        status: TradeStatus.CANCELED
      })

      if (tt) {
        Trade.deleteTradeExpiration(trade.id)
        Trade.deleteEscrowExpiration(trade.id)
      }

      return tt
    }

    return null
  }

  static async paymentSent(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findOne({
      where: {
        status: TradeStatus.ACCEPTED,
        id: tradeId
      }
    })

    if (!trade) {
      return null
    }

    const tt = trade.update({
      status: TradeStatus.PAYMENT_SENT
    })

    if (tt) {
      Trade.deleteEscrowExpiration(trade.id)
    }
    return tt
  }

  static async paymentReceived(tradeId: number): Promise<Trade | null> {
    // TODO: Lock all in sequelize transaction
    const trade = await Trade.findOne({
      where: {
        status: TradeStatus.PAYMENT_SENT,
        id: tradeId
      }
    })

    if (!trade) {
      return null
    }

    const tt = trade.update({
      status: TradeStatus.PAYMENT_RELEASED
    })

    if (tt) {
      await Transaction.releaseTradeToBuyer(
        trade.blockedTransactionId,
        trade.buyerUserId
      )
    }

    return tt
  }

  static async closeEscrow(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.findById(tradeId)
    if (!trade) {
      logger.error(
        'ALERT! Tradeid does not exist for escrow release. ' + tradeId
      )
      return null
    }

    if (trade.status === TradeStatus.ACCEPTED) {
      await Transaction.unblockTx(trade.blockedTransactionId)
      await trade.update({
        status: TradeStatus.ESCROW_CLOSED
      })
      return trade
    } else {
      logger.error(
        'Invalid trade status to release escrow: ' +
          trade.status +
          ', ' +
          tradeId
      )
      return null
    }
  }

  static async deleteTradeExpiration(tradeId: number) {
    const tradeExpiryKey = CacheHelper.getKeyForId(
      CacheKey.TradeInitExpiry,
      tradeId
    )
    await cacheConnection.getClient.delAsync(tradeExpiryKey)
  }

  static async deleteEscrowExpiration(tradeId: number) {
    const escrowClosedExpiryKey = CacheHelper.getKeyForId(
      CacheKey.TradeEscrowClosedExpiry,
      tradeId
    )
    const escrowWarnExpiryKey = CacheHelper.getKeyForId(
      CacheKey.TradeEscrowWarnExpiry,
      tradeId
    )

    await cacheConnection.getClient.delAsync(escrowWarnExpiryKey)
    await cacheConnection.getClient.delAsync(escrowClosedExpiryKey)
  }

  getOpUserId(): number {
    return this.tradeType === OrderType.BUY
      ? this.sellerUserId
      : this.buyerUserId
  }

  getEscrowReleaseSecondsLeft(): number | null {
    if (this.status === TradeStatus.ACCEPTED) {
      const tradeAcceptedAt = moment(this.updatedAt)
      const escrowCloseTime = tradeAcceptedAt.add(
        parseInt(CONFIG.TRADE_ESCROW_TIMEOUT_S),
        'seconds'
      )
      return moment.duration(escrowCloseTime.diff(moment())).asSeconds()
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
