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

@Table({ timestamps: true, tableName: 'Referrals', paranoid: true })
export class Referral extends Model<Referral> {
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
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  referredUser!: number

  static async createReferral(userId: number, referredUserId: number) {
    return await Referral.create<Referral>(
      {
        userId,
        referredUser: referredUserId
      },
      {}
    )
  }
}

export default Referral
