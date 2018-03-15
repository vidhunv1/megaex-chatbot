import {Table, Column, Model, PrimaryKey, AllowNull, AutoIncrement, HasOne} from 'sequelize-typescript';
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

  @Column
  currencyCode!: string;
}