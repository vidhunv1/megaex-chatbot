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
import User from './User'
import Order from './Order'
import Transaction from './Transaction'

export enum TradeStatus {
  INITIATED = 'INITIATED',
  ACCEPTED = 'ACCEPTED',
  CANCELED = 'CANCELED',

  PAYMENT_MARKED = 'PAYMENT_MARKED',
  PAYMENT_RELEASED = 'PAYMENT_RELEASED',
  PAYMENT_DISPUTE = 'PAYMENT_DISPUTE'
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

  @Column(DataType.FLOAT)
  amount!: number

  @Column(DataType.STRING)
  status!: TradeStatus

  async initiateTrade(openedByUserId: number, orderId: number, amount: number) {
    await Trade.create<Trade>({
      openedByUserId,
      orderId,
      amount,
      status: TradeStatus.INITIATED
    })
  }

  async acceptTrade(tradeId: number): Promise<Trade> {
    const trade = await Trade.findById(tradeId, {
      include: [{ model: Order }]
    })
    if (!trade || !trade.order) {
      throw new Error('Trade / Order now found')
    }

    const tx = await Transaction.blockBalance(
      trade.order.userId,
      trade.order.cryptoCurrencyCode,
      trade.amount,
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

  async releasePayment(tradeId: number): Promise<Trade> {
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
}

export default Trade
