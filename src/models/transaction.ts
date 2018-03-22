import {Table, Column, Model, ForeignKey, Unique ,DataType, BelongsTo, PrimaryKey, AllowNull} from 'sequelize-typescript';
import User from './user';

@Table({timestamps: true, tableName: 'Transactions'})
export default class Transaction extends Model<Transaction> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Unique
  @Column
  transactionId!: string;

  @AllowNull(false)
  @Column
  transactionType!: string;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount!: number;

  @AllowNull(false)
  @Column
  confirmations!: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  receivedTime!: Date;

  @AllowNull(false)
  @Column
  transactionSource!: string;

  @AllowNull(false)
  @Column
  currencyCode!: string
}
