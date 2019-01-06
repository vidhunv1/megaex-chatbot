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
import User from './user'
import PaymentDetail from './payment_detail'

@Table({ timestamps: true, tableName: 'PaymentMethods', paranoid: true })
export default class PaymentMethod extends Model<PaymentMethod> {
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
  @ForeignKey(() => PaymentDetail)
  @Column(DataType.BIGINT)
  paymentId!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  field1!: string

  @AllowNull(true)
  @Column(DataType.STRING)
  field2!: string

  @AllowNull(true)
  @Column(DataType.STRING)
  field3!: string

  @AllowNull(true)
  @Column(DataType.STRING)
  field4!: string
}
