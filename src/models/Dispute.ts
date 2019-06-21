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
import Trade from './Trade'

export enum DisputeStatus {
  PENDING = 'PENDING',
  RESOLVED = 'RESOLVED'
}

@Table({ timestamps: true, tableName: 'Disputes', paranoid: true })
export class Dispute extends Model<Dispute> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  openedByUserId!: number

  @AllowNull(false)
  @ForeignKey(() => Trade)
  @Column(DataType.BIGINT)
  tradeId!: number

  @BelongsTo(() => Trade)
  trade!: Trade

  @AllowNull(false)
  @Column(DataType.STRING)
  status!: DisputeStatus
}

export default Dispute
