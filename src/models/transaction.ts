import {Table, Column, Model, ForeignKey, Unique ,DataType, BelongsTo, PrimaryKey, AllowNull, AutoIncrement} from 'sequelize-typescript';
import User from './user';

@Table({timestamps: true, tableName: 'Transactions'})
export default class Transaction extends Model<Transaction> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
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

  //All send balances are negative
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

  static async getTotalBalance(userId:number, currencyCode:string) {
    // TODO: If you are paranoid, check validity of all transations from core-wallet and verify jwt for payment codes. 
    // For now this should do.

    // some bug, have to parse & stringify to get sum
    let totalBalance:number = JSON.parse(JSON.stringify(await Transaction.find({attributes: [[Transaction.sequelize.literal('SUM(amount)'), 'sum']], where: {currencyCode: currencyCode, userId: userId}}))).sum;
    return totalBalance;
  }
}
