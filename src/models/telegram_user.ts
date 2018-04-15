import {Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull} from 'sequelize-typescript';
import User from './user';
import RandomGenerator from '../helpers/random-generator'

@Table({timestamps: true, tableName: 'TelegramUsers'})
export default class TelegramUser extends Model<TelegramUser> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.BIGINT)
  id!: number; //corresponds to UserId field from telegram

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User;

  @Column
  firstName!: string;

  @Column
  lastName!: string;

  @Column
  languageCode!: string;

  @Column
  username!: string

  async create(): Promise<TelegramUser> {
    let idGen:RandomGenerator =  new RandomGenerator();
    let accountId = await idGen.generateId();
    let accId, u = null;
    do {
      accId = await idGen.generateId();
      u = await User.findOne({
        where: {
          accountId: accId
        }
      })
    } while (u !== null);
    let us = (await User.create<User>({accountId: accountId}, {}))
    let tUser =  await TelegramUser.create<TelegramUser>({ id: this.id, firstName: this.firstName, lastName: this.lastName, languageCode: this.languageCode, username: this.username, userId: us.id }, {})
    tUser.user = us;
    return tUser;
  }
}