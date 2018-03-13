import {Table, Column, Model, PrimaryKey, AllowNull, AutoIncrement, HasOne, Unique, Default} from 'sequelize-typescript';
import TelegramUser from './telegram_user'

@Table({timestamps: true, tableName: 'Users'})
export default class User extends Model<User> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @HasOne(() => TelegramUser, 'userId')
  telegramUser!: TelegramUser;

  @Column
  language!: string;

  @Unique
  @Column
  accountId!: string;

  @Column
  currencyCode!: string;

  @Default(false)
  @Column
  isTermsAccepted!: boolean;

  @Default(0)
  @Column
  messageCount!: number
}