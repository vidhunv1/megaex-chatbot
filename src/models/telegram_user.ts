import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull
} from 'sequelize-typescript'
import { User } from './user'
import RandomGenerator from '../lib/random-generator'

@Table({ timestamps: true, tableName: 'TelegramUsers' })
export class TelegramAccount extends Model<TelegramAccount> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.BIGINT)
  id!: number // corresponds to msg.from.id field from telegram

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User

  @Column
  firstName!: string

  @Column
  lastName!: string

  @Column
  languageCode!: string

  @Column
  username!: string

  async create(): Promise<TelegramAccount> {
    const idGen: RandomGenerator = new RandomGenerator()
    const accountId = await idGen.generateId()
    let accId,
      u = null,
      i = 0
    do {
      accId = await idGen.generateId()
      u = await User.findOne({ where: { accountId: accId } })
      i++
    } while (u !== null)
    console.log(`${i} attempts to generate random user id`)
    const us = await User.create<User>({ accountId: accountId }, {})
    const tUser = await TelegramAccount.create<TelegramAccount>(
      {
        id: this.id,
        firstName: this.firstName,
        lastName: this.lastName,
        languageCode: this.languageCode,
        username: this.username,
        userId: us.id
      },
      {}
    )
    tUser.user = us
    return tUser
  }
}

export default TelegramAccount
