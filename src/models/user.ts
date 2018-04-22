import {Table, Column, Model, PrimaryKey, AllowNull, AutoIncrement, HasOne, Unique, Default, HasMany} from 'sequelize-typescript';
import TelegramUser from './telegram_user'
import Wallet from './wallet';
import Transaction from './transaction';
import PaymentMethod from './payment_method';
import I18n from '../helpers/i18n'

@Table({timestamps: true, tableName: 'Users'})
export default class User extends Model<User> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @HasOne(() => TelegramUser, 'userId')
  telegramUser!: TelegramUser;

  @HasMany(() => Wallet, 'userId')
  wallets!: Wallet[];

  @HasMany(() => Transaction, 'userId')
  transactions!: Transaction[];

  @HasMany(() => PaymentMethod, 'userId')
  paymentMethods!: PaymentMethod[];

  @Default('en')
  @Column
  public locale!: string;

  @Unique
  @Column
  accountId!: string;

  @Default(false)
  @Column
  isTermsAccepted!: boolean;

  @Default(false)
  @Column
  isVerified!: boolean;

  @Column
  currencyCode!: string

  @Default('[]')
  @Column
  blockedUsers!: string

  @Default(0)
  @Column
  messageCount!: number

  __(...args:any[]):string {
    let locale = this.locale ? this.locale : 'en';
    let i18n = (new I18n()).getI18n();
    args[0] = {phrase: args[0], locale: locale}
    return i18n.__.apply(null, args);
  }

  __n(phrase: string, count: number):string {
    let i18n = (new I18n()).getI18n();
    return i18n.__n({singular: phrase, plural: phrase, count: count, locale: 'en'});
  }
}