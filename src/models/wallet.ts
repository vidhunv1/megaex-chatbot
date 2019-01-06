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
import User from './user'
import MessageQueue from '../helpers/message-queue'
import Logger from '../helpers/logger'
import { Transaction as SequelizeTransacion } from 'sequelize'

@Table({ timestamps: true, tableName: 'Wallets' })
export default class Wallet extends Model<Wallet> {
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

  // calling this will create all wallets for the userId, should be called only once.
  async create(): Promise<Wallet[] | null> {
    console.log('Creating wallets')
    const logger = new Logger().getLogger()

    const messageQueue = new MessageQueue()
    try {
      const wallets: Wallet[] | null = []

      const btcWallet = await Wallet.create<Wallet>(
        { userId: this.userId, currencyCode: 'btc' },
        {}
      )
      const tBtcWallet = await Wallet.create<Wallet>(
        { userId: this.userId, currencyCode: 'tbtc' },
        {}
      )
      // generate btc address
      const btcAddress = await messageQueue.generateBtcAddress(this.userId)
      btcWallet.updateAttributes({ address: btcAddress })
      btcWallet.address = btcAddress
      // generate testnet btc address
      const btcTestAddress = await messageQueue.generateBtcAddress(this.userId)
      tBtcWallet.updateAttributes({ address: btcTestAddress })
      tBtcWallet.address = btcTestAddress
      wallets.push(btcWallet)
      wallets.push(tBtcWallet)

      console.log('WALLETS LIST: ' + JSON.stringify(wallets))
      return wallets
    } catch (e) {
      logger.error('error creating bitcoin wallet: ' + JSON.stringify(e))
      return null
    }
  }

  async newAddress(): Promise<string | null> {
    const messageQueue = new MessageQueue()
    const logger = new Logger().getLogger()
    try {
      if (this.currencyCode === 'btc') {
        const btcAddress = await messageQueue.generateBtcAddress(this.userId)
        await this.updateAttributes({ address: btcAddress })
        return btcAddress
      } else if (this.currencyCode === 'tbtc') {
        const btcAddress = await messageQueue.generateBtcAddress(this.userId)
        await this.updateAttributes({ address: btcAddress })
        return btcAddress
      }
      return null
    } catch (e) {
      logger.error(
        'Error generating new address: ' +
          JSON.stringify(this) +
          ', error: ' +
          JSON.stringify(e)
      )
      return null
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
    const logger = new Logger().getLogger()
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}
