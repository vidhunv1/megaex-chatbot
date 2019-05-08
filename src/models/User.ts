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
import { TelegramAccount, Wallet, Transaction, PaymentMethod } from '.'
import i18n from '../modules/i18n'
import { LanguageISO, Language } from '../constants/languages'
import { FiatCurrency } from 'constants/currencies'
import { ExchangeSource } from 'constants/exchangeSource'

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

  @Default(Language.ENGLISH)
  @Column
  public locale!: Language

  @Unique
  @Column
  accountId!: string

  @Default(false)
  @Column
  isTermsAccepted!: boolean

  @Default(false)
  @Column
  isVerified!: boolean

  @Default(ExchangeSource.BINANCE)
  @Column
  exchangeRateSource!: ExchangeSource

  @Column
  currencyCode!: FiatCurrency

  @Default(0)
  @Column
  messageCount!: number

  t(key: string, values?: any): string {
    return i18n.getI18n.t(key, {
      ...values,
      lng: LanguageISO[this.locale] || LanguageISO[Language.ENGLISH]
    })
  }
}

export default User
