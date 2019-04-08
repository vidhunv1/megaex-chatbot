import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  HasOne,
  Unique,
  Default,
  HasMany
} from 'sequelize-typescript'
import { TelegramAccount, Wallet, Transaction, PaymentMethod } from './'
import i18n from '../modules/i18n'

@Table({ timestamps: true, tableName: 'Users' })
export class User extends Model<User> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @HasOne(() => TelegramAccount, 'userId')
  telegramUser!: TelegramAccount

  @HasMany(() => Wallet, 'userId')
  wallets!: Wallet[]

  @HasMany(() => Transaction, 'userId')
  transactions!: Transaction[]

  @HasMany(() => PaymentMethod, 'userId')
  paymentMethods!: PaymentMethod[]

  @Default('en')
  @Column
  public locale!: string

  @Unique
  @Column
  accountId!: string

  @Default(false)
  @Column
  isTermsAccepted!: boolean

  @Default(false)
  @Column
  isVerified!: boolean

  @Default('localrate')
  @Column
  exchangeRateSource!:
    | 'localrate'
    | 'localbitcoins'
    | 'kraken'
    | 'coinbase'
    | 'bitfinex'

  @Column
  currencyCode!: string

  @Default('[]')
  @Column
  blockedUsers!: string

  @Default(0)
  @Column
  messageCount!: number

  __(...args: any[]): string {
    return i18n.getI18n.t(args[0], { lng: this.locale })
  }

  __n(phrase: string, _count: number): string {
    return i18n.getI18n.t(phrase, { lng: this.locale })
  }

  t(key: string, values?: any): string {
    return i18n.getI18n.t(key, { ...values, lng: this.locale })
  }
}

export default User
