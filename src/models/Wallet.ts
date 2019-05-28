import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  AutoIncrement
} from 'sequelize-typescript'
import { User } from './User'
import { logger } from '../modules'
import { CryptoCurrency } from '../constants/currencies'
import btcRpc, { BtcCommands } from 'core/crypto/btcRpc'
import { amqp } from 'modules'

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

  @AllowNull(true)
  @Column
  address!: string

  @AllowNull(false)
  @Column
  currencyCode!: CryptoCurrency

  // calling this will create all wallets for the userId
  async createAll(): Promise<boolean | null> {
    try {
      await Wallet.create<Wallet>(
        { userId: this.userId, currencyCode: CryptoCurrency.BTC },
        {}
      )

      try {
        const res = await btcRpc.btcRpcCall<BtcCommands.GET_NEW_ADDRESS>(
          BtcCommands.GET_NEW_ADDRESS,
          [this.userId + '']
        )
        if (!res.result) {
          throw new Error('Generate wallet error response')
        }

        await Wallet.updateNewAddress(
          this.userId,
          CryptoCurrency.BTC,
          res.result
        )
      } catch (e) {
        logger.error('Error generating wallet address: ' + e)
        // Add to generate address queue
        await amqp.walletQ.genAddressToQ({
          currency: CryptoCurrency.BTC,
          userId: this.userId + ''
        })
      }
      return true
    } catch (e) {
      logger.error('error creating wallets: ' + JSON.stringify(e))
      throw e
    }
  }

  static async updateNewAddress(
    userId: number,
    currency: CryptoCurrency,
    address: string
  ): Promise<boolean> {
    const wallet: Wallet | null = await Wallet.findOne({
      where: { userId: userId, currencyCode: currency }
    })

    if (wallet) {
      await wallet.updateAttributes({
        address
      })
      return true
    } else {
      logger.error('Wallet not found')
      throw new WalletError(WalletError.NOT_FOUND)
    }
  }
}

export class WalletError extends Error {
  public status: number
  public static NOT_FOUND = 404

  constructor(status: number = 500, message: string = 'Wallet Error') {
    super(message)
    this.name = this.constructor.name
    logger.warn(this.constructor.name + ', ' + status)

    if (status === WalletError.NOT_FOUND) {
      logger.error('Wallet not found')
      throw new Error('Wallet not found')
    }
    this.status = status
  }
}

export default Wallet
