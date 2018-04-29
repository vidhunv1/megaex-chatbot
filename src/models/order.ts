import {Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull, AutoIncrement, Default} from 'sequelize-typescript';
import User from './user';

@Table({timestamps: true, tableName: 'Orders'})
export default class Order extends Model<Order> {
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
  user!: User;

  @AllowNull(false)
  @Column(DataType.FLOAT)
  minAmount!:number

  @AllowNull(true)
  @Column(DataType.FLOAT)
  maxAmount!:number

  @AllowNull(true)
  @ForeignKey(() => Order)
  @Column(DataType.INTEGER)
  matchedOrderId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  type!: 'buy'|'sell';

  @AllowNull(false)
  @Column(DataType.STRING)
  status!:'pending'|'matched'|'accepted'|'completed';

  @AllowNull(true)
  @Column(DataType.STRING)
  paymentMethodFilters!:string;

  @AllowNull(true)
  @Column(DataType.STRING)
  accountVerifiedFilter!:string;

  @AllowNull(true)
  @Column(DataType.DATE)
  confirmedTime!:Date;

  @AllowNull(false)
  @Default(0)
  @Column(DataType.INTEGER)
  cancelCount!:number;
}