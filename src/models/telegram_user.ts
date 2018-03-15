import {Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull} from 'sequelize-typescript';
import User from './user';

@Table({timestamps: true, tableName: 'TelegramUsers'})
export default class TelegramUser extends Model<TelegramUser> {
  @PrimaryKey
  @AllowNull(false)
  @Column(DataType.BIGINT)
  id!: number; //corresponds to UserId field from telegram

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column
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
}