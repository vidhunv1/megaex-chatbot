import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  Default,
  AutoIncrement
} from 'sequelize-typescript'
import { User } from './user'
import walletQueue from '../modules/queue/wallet/wallet-queue'
import logger from '../modules/logger'
import { Transaction as SequelizeTransacion } from 'sequelize'
import { CryptoCurrency } from '../constants/currencies'

@Table({ timestamps: true, tableName: 'Wallets' })
export class Wallet extends Model<Wallet> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  availableBalance!: number

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  unconfirmedBalance!: number

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  blockedBalance!: number

  @AllowNull(true)
  @Column
  address!: string

  @AllowNull(false)
  @Column
  currencyCode!: string

  // calling this will create all wallets for the userId
  async create(): Promise<boolean | null> {
    try {
      await Wallet.create<Wallet>(
        { userId: this.userId, currencyCode: CryptoCurrency.BTC },
        {}
      )
      // generate btc address queue
      await walletQueue.generateNewAddress(CryptoCurrency.BTC, this.userId)

      return true
    } catch (e) {
      logger.error('error creating wallets: ' + JSON.stringify(e))
      throw e
    }
  }

  static async unblockBalance(
    userId: string | number,
    currencyCode: string,
    amount: number,
    transaction?: SequelizeTransacion
  ) {
    const wallet: Wallet | null = await Wallet.findOne({
      where: { userId: userId, currencyCode: currencyCode }
    })
    if (wallet) {
      if (wallet.blockedBalance >= amount) {
        await wallet.updateAttributes(
          {
            availableBalance: wallet.availableBalance + amount,
            blockedBalance: wallet.blockedBalance - amount
          },
          { transaction: transaction }
        )
        return true
      } else {
        throw new WalletError(WalletError.INSUFFICIENT_BALANCE)
      }
    } else {
      throw new WalletError(WalletError.NOT_FOUND)
    }
  }

  static async blockBalance(
    userId: string | number,
    currencyCode: string,
    amount: number,
    transaction?: SequelizeTransacion
  ) {
    const wallet: Wallet | null = await Wallet.findOne({
      where: { userId: userId, currencyCode: currencyCode }
    })
    if (wallet) {
      if (wallet.availableBalance >= amount) {
        await wallet.updateAttributes(
          {
            availableBalance: wallet.availableBalance - amount,
            blockedBalance: wallet.blockedBalance + amount
          },
          { transaction: transaction }
        )
        return true
      } else {
        throw new WalletError(WalletError.INSUFFICIENT_BALANCE)
      }
    } else {
      throw new WalletError(WalletError.NOT_FOUND)
    }
  }
}

export class WalletError extends Error {
  public status: number
  public static INSUFFICIENT_BALANCE = 490
  public static NOT_FOUND = 404

  constructor(status: number = 500, message: string = 'Wallet Error') {
    super(message)
    this.name = this.constructor.name
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Wallet
