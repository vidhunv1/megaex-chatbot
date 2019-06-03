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
import User from './User'
import { CryptoCurrency, cryptoCurrencyInfo } from 'constants/currencies'
import Transaction from './Transaction'
import logger from 'modules/logger'

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED'
}

@Table({ timestamps: true, tableName: 'Withdrawals', paranoid: true })
export class Withdrawal extends Model<Withdrawal> {
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
  @Column
  cryptoCurrencyCode!: CryptoCurrency

  @AllowNull(false)
  @Column
  amount!: number

  @AllowNull(false)
  @Column
  withdrawAddress!: string

  @AllowNull(false)
  @Column
  feePriority!: number // High number, high priority

  @AllowNull(false)
  @Default(WithdrawalStatus.PENDING)
  @Column
  status!: WithdrawalStatus

  @Column
  txid!: string

  static async createWithdrawal(
    userId: number,
    cryptoCurrencyCode: CryptoCurrency,
    amount: number,
    address: string
  ): Promise<Withdrawal | undefined> {
    const availableBalance = await Transaction.getAvailableBalance(
      userId,
      cryptoCurrencyCode
    )
    if (amount > availableBalance) {
      logger.error('Insufficient balance for withdrawal. model/withdrawal')
      throw new Error('Insufficient balance')
    }
    if (
      availableBalance <
      cryptoCurrencyInfo[cryptoCurrencyCode].minWithdrawalAmount
    ) {
      logger.error('withdrawal amount less than min. model/withdrawal')
      throw new Error('withdrawal amount less than min')
    }

    let withdrawal
    await this.sequelize.transaction(async function(t) {
      withdrawal = await Withdrawal.create<Withdrawal>(
        {
          userId,
          cryptoCurrencyCode,
          amount,
          feePriority: 0,
          withdrawAddress: address,
          status: WithdrawalStatus.PENDING
        },
        {
          transaction: t
        }
      )

      if (!withdrawal) {
        throw new Error('WIthdrawal not found models/withdrawal')
      }
      await Transaction.addWithdrawalTransaction(
        withdrawal.userId,
        withdrawal.amount,
        withdrawal.cryptoCurrencyCode,
        withdrawal.id + '',
        t
      )
    })

    return withdrawal
  }

  static async processCompletedWithdrawal(withdrawalId: number, txid: string) {
    const withdrawal = await Withdrawal.findById(withdrawalId)
    if (!withdrawal || withdrawal.status === WithdrawalStatus.COMPLETED) {
      logger.error('Error processing withdrawal')
      throw new Error('Error processing withdrawal')
    }
    return await Withdrawal.update(
      {
        status: WithdrawalStatus.COMPLETED,
        txid
      },
      {
        where: {
          id: withdrawalId
        }
      }
    )
  }
}

export default Withdrawal
