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
import { User } from '.'
import { Transaction as SequelizeTransacion } from 'sequelize'
import { logger, telegramHook } from '../modules'
import { CryptoCurrency, cryptoCurrencyInfo } from 'constants/currencies'
import TelegramAccount from './TelegramAccount'
import { dataFormatter } from 'utils/dataFormatter'
import { Namespace } from 'modules/i18n'

export enum TransactionType {
  SEND = 'SEND',
  RECEIVE = 'RECEIVE'
}

export enum TransactionSource {
  PAYMENT = 'PAYMENT',
  CORE = 'CORE'
}

@Table({ timestamps: true, tableName: 'Transactions' })
export class Transaction extends Model<Transaction> {
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
  @Column
  txid!: string

  @AllowNull(false)
  @Column
  transactionType!: TransactionType

  // All send balances are negative
  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount!: number

  @AllowNull(true)
  @Column
  confirmations!: number

  @AllowNull(false)
  @Column
  transactionSource!: TransactionSource

  @AllowNull(false)
  @Column
  currencyCode!: CryptoCurrency

  static async getConfirmedBalance(
    userId: number,
    currencyCode: CryptoCurrency
  ): Promise<number> {
    // some bug, have to parse & stringify to get sum
    const bal: number = JSON.parse(
      JSON.stringify(
        await Transaction.find({
          attributes: [[Transaction.sequelize.literal('SUM(amount)'), 'sum']],
          where: {
            currencyCode: currencyCode,
            userId: userId,
            confirmations: {
              $gte: cryptoCurrencyInfo[currencyCode].confirmations
            }
          }
        })
      )
    ).sum
    return bal
  }

  static async getUnonfirmedBalance(
    userId: number,
    currencyCode: CryptoCurrency
  ): Promise<number> {
    // some bug, have to parse & stringify to get sum
    const bal: number = JSON.parse(
      JSON.stringify(
        await Transaction.find({
          attributes: [[Transaction.sequelize.literal('SUM(amount)'), 'sum']],
          where: {
            currencyCode: currencyCode,
            userId: userId,
            confirmations: {
              $lt: cryptoCurrencyInfo[currencyCode].confirmations
            }
          }
        })
      )
    ).sum
    return bal
  }

  static async createOrUpdateDepositTx(
    userId: number,
    currencyCode: CryptoCurrency,
    txid: string,
    amount: number,
    confirmations: number,
    transactionSource: TransactionSource
  ) {
    const txn = await Transaction.findOne<Transaction>({
      where: {
        txid: txid,
        transactionType: TransactionType.RECEIVE
      }
    })

    try {
      if (txn) {
        // transaction exists, update it
        await Transaction.update<Transaction>(
          {
            confirmations: confirmations
          },
          {
            where: {
              txid: txid
            }
          }
        )

        // Notify about the transaction
        const requiredConfirmation =
          cryptoCurrencyInfo[currencyCode].confirmations
        if (confirmations >= requiredConfirmation) {
          const user = await User.findOne({
            where: {
              id: userId
            },
            include: [{ model: TelegramAccount }]
          })

          if (user) {
            await telegramHook.getWebhook.sendMessage(
              user.telegramUser.id,
              user.t(`${Namespace.Wallet}:transaction.new-tx-confirmed`, {
                cryptoCurrencyValue: dataFormatter.formatCryptoCurrency(
                  amount,
                  currencyCode
                ),
                cryptoCurrencyCode: currencyCode
              }),
              {
                parse_mode: 'Markdown'
              }
            )
          }
        }
      } else {
        await Transaction.create<Transaction>({
          userId: userId,
          currencyCode: currencyCode,
          amount: amount,
          txid: txid,
          confirmations: confirmations,
          transactionType: TransactionType.RECEIVE,
          transactionSource: transactionSource
        })

        // Notify about the transaction
        const requiredConfirmation =
          cryptoCurrencyInfo[currencyCode].confirmations
        if (confirmations < requiredConfirmation) {
          const user = await User.findOne({
            where: {
              id: userId
            },
            include: [{ model: TelegramAccount }]
          })

          if (user) {
            await telegramHook.getWebhook.sendMessage(
              user.telegramUser.id,
              user.t(`${Namespace.Wallet}:transaction.new-incoming-tx`, {
                cryptoCurrencyCode: currencyCode,
                cryptoCurrencyValue: dataFormatter.formatCryptoCurrency(
                  amount,
                  currencyCode
                ),
                requiredConfirmation,
                txid: txid,
                txUrl: cryptoCurrencyInfo[currencyCode].getTxUrl(txid)
              }),
              {
                parse_mode: 'Markdown'
              }
            )
          }
        }
      }
    } catch (e) {
      logger.error('TRANSACTION: error creating transaction')
      throw e
    }
  }

  static async transfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
    currencyCode: CryptoCurrency,
    txid: string,
    transaction: SequelizeTransacion
  ) {
    const balance: number = await Transaction.getConfirmedBalance(
      fromUserId,
      currencyCode
    )
    if (balance < amount) {
      throw new TransactionError(TransactionError.INSUFFICIENT_BALANCE)
    }
    const senderTransaction = new Transaction({
      userId: fromUserId,
      txid: txid,
      amount: -1 * amount,
      transactionSource: TransactionSource.PAYMENT,
      transactionType: TransactionType.SEND,
      currencyCode: currencyCode
    })
    await senderTransaction.save({ transaction: transaction })

    const receiverTransaction = new Transaction({
      userId: toUserId,
      txid: txid,
      amount: amount,
      transactionSource: TransactionSource.PAYMENT,
      transactionType: TransactionType.RECEIVE,
      currencyCode: currencyCode
    })
    await receiverTransaction.save({ transaction: transaction })
  }

  // static async unblockBalance(
  //   userId: string | number,
  //   currencyCode: CryptoCurrency,
  //   amount: number,
  //   transaction?: SequelizeTransacion
  // ) {
  //   const wallet: Wallet | null = await Wallet.findOne({
  //     where: { userId: userId, currencyCode: currencyCode }
  //   })
  //   if (wallet) {
  //     if (wallet.blockedBalance >= amount) {
  //       await wallet.updateAttributes(
  //         {
  //           availableBalance: wallet.availableBalance + amount,
  //           blockedBalance: wallet.blockedBalance - amount
  //         },
  //         { transaction: transaction }
  //       )
  //       return true
  //     } else {
  //       throw new WalletError(WalletError.INSUFFICIENT_BALANCE)
  //     }
  //   } else {
  //     logger.error('Wallet not found')
  //     throw new WalletError(WalletError.NOT_FOUND)
  //   }
  // }

  // static async blockBalance(
  //   userId: string | number,
  //   currencyCode: string,
  //   amount: number,
  //   transaction?: SequelizeTransacion
  // ) {
  //   const wallet: Wallet | null = await Wallet.findOne({
  //     where: { userId: userId, currencyCode: currencyCode }
  //   })
  //   if (wallet) {
  //     if (wallet.availableBalance >= amount) {
  //       await wallet.updateAttributes(
  //         {
  //           availableBalance: wallet.availableBalance - amount,
  //           blockedBalance: wallet.blockedBalance + amount
  //         },
  //         { transaction: transaction }
  //       )
  //       return true
  //     } else {
  //       throw new WalletError(WalletError.INSUFFICIENT_BALANCE)
  //     }
  //   } else {
  //     throw new WalletError(WalletError.NOT_FOUND)
  //   }
  // }
}

export class TransactionError extends Error {
  public status: number
  public static INSUFFICIENT_BALANCE = 490

  constructor(status: number = 500, message: string = 'Transaction Error') {
    super(message)
    this.name = this.constructor.name
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Transaction
