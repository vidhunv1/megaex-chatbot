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
import I18n from '../lib/i18n'

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
    const locale = this.locale ? this.locale : 'en'
    const i18n = new I18n().getI18n()
    args[0] = { phrase: args[0], locale: locale }
    return i18n.__.apply(null, args as any)
  }

  __n(phrase: string, count: number): string {
    const i18n = new I18n().getI18n()
    return i18n.__n({
      singular: phrase,
      plural: phrase,
      count: count,
      locale: 'en'
    })
  }
}

export default User
