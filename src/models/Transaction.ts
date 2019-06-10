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
  CORE = 'CORE',
  WITHDRAWAL = 'WITHDRAWAL',
  BLOCK = 'BLOCK',
  RELEASE = 'RELEASE'
}

@Table({ timestamps: true, tableName: 'Transactions', paranoid: true })
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

  // Gets sum of all wallet deposit through core
  static async getCoreDepositAmount(
    userId: number,
    currencyCode: CryptoCurrency
  ): Promise<{
    confirmedBalance: number
    unconfirmedBalance: number
  } | null> {
    const requiredConfirmations = cryptoCurrencyInfo[currencyCode].confirmations

    // why to parse & stringify to get sum?
    return JSON.parse(
      JSON.stringify(
        await Transaction.find({
          attributes: [
            [
              Transaction.sequelize.literal(
                `SUM(CASE WHEN confirmations >= ${requiredConfirmations} THEN amount ELSE 0 END)`
              ),
              'confirmedBalance'
            ],
            [
              Transaction.sequelize.literal(
                'SUM(CASE WHEN confirmations = 0 THEN amount ELSE 0 END)'
              ),
              'unconfirmedBalance'
            ]
          ],
          where: {
            userId,
            currencyCode: currencyCode,
            transactionType: TransactionType.RECEIVE,
            transactionSource: TransactionSource.CORE
          }
        })
      )
    ) as {
      confirmedBalance: number
      unconfirmedBalance: number
    } | null
  }

  // gets the balance available for spending
  static async getAvailableBalance(
    userId: number,
    currencyCode: CryptoCurrency
  ): Promise<number> {
    const requiredConfirmations = cryptoCurrencyInfo[currencyCode].confirmations
    return (
      JSON.parse(
        JSON.stringify(
          await Transaction.find({
            attributes: [
              [
                Transaction.sequelize.literal(
                  `SUM(CASE WHEN confirmations >= ${requiredConfirmations} THEN amount ELSE 0 END)`
                ),
                'availableBalance'
              ]
            ],
            where: {
              userId,
              currencyCode: currencyCode
            }
          })
        )
      ).availableBalance || 0
    )
  }

  static async getBlockedBalance(
    userId: number,
    currencyCode: CryptoCurrency
  ): Promise<number> {
    const tx = JSON.parse(
      JSON.stringify(
        await Transaction.find({
          attributes: [
            [
              Transaction.sequelize.literal(
                `SUM(CASE WHEN "transactionSource" = '${
                  TransactionSource.BLOCK
                }' THEN amount ELSE 0 END)`
              ),
              'blockedBalance'
            ],
            [
              Transaction.sequelize.literal(
                `SUM(CASE WHEN "transactionSource" = '${
                  TransactionSource.RELEASE
                }' THEN amount ELSE 0 END)`
              ),
              'releasedBalance'
            ]
          ],
          where: {
            userId,
            currencyCode: currencyCode
          }
        })
      )
    )

    return (tx.blockedBalance || 0) + (tx.releasedBalance || 0)
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
        transactionType: TransactionType.RECEIVE,
        transactionSource: TransactionSource.CORE
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
    const balance = await Transaction.getAvailableBalance(
      fromUserId,
      currencyCode
    )
    if (!balance || (balance && balance < amount)) {
      throw new TransactionError(TransactionError.INSUFFICIENT_BALANCE)
    }
    const senderTransaction = new Transaction({
      userId: fromUserId,
      txid: txid,
      amount: -1 * amount,
      transactionSource: TransactionSource.PAYMENT,
      transactionType: TransactionType.SEND,
      currencyCode: currencyCode,
      confirmations: 10
    })
    await senderTransaction.save({ transaction: transaction })

    const receiverTransaction = new Transaction({
      userId: toUserId,
      txid: txid,
      amount: amount,
      transactionSource: TransactionSource.PAYMENT,
      transactionType: TransactionType.RECEIVE,
      currencyCode: currencyCode,
      confirmations: 10
    })
    await receiverTransaction.save({ transaction: transaction })
  }

  static async listTransactions(userId: number): Promise<Transaction[]> {
    return Transaction.findAll({
      where: {
        userId: userId
      }
    })
  }

  static async addWithdrawalTransaction(
    userId: number,
    amount: number,
    currencyCode: CryptoCurrency,
    txid: string,
    transaction: SequelizeTransacion
  ): Promise<Transaction> {
    const balance = await Transaction.getAvailableBalance(userId, currencyCode)
    if (!balance || (balance && balance < amount)) {
      throw new TransactionError(TransactionError.INSUFFICIENT_BALANCE)
    }

    if (amount < cryptoCurrencyInfo[currencyCode].minWithdrawalAmount) {
      logger.error('withdrawal amount less than min. model/withdrawal')
      throw new Error('withdrawal amount less than min')
    }

    const tx = new Transaction({
      userId,
      txid,
      amount: -1 * Math.abs(amount),
      transactionSource: TransactionSource.WITHDRAWAL,
      transactionType: TransactionType.SEND,
      currencyCode: currencyCode,
      confirmations: 10
    })
    await tx.save({ transaction: transaction })

    return tx
  }

  static async blockBalance(
    userId: number,
    cryptoCurrency: CryptoCurrency,
    amount: number,
    txid: string,
    transaction?: SequelizeTransacion
  ): Promise<Transaction> {
    const balance = await Transaction.getAvailableBalance(
      userId,
      cryptoCurrency
    )
    if (balance < amount) {
      logger.error('Not enough balance to block balance')
      throw new TransactionError(TransactionError.INSUFFICIENT_BALANCE)
    }

    const tx = new Transaction({
      userId,
      txid: txid,
      amount: -1 * amount,
      transactionSource: TransactionSource.BLOCK,
      transactionType: TransactionType.SEND,
      currencyCode: cryptoCurrency,
      confirmations: 10
    })
    return await tx.save({ transaction: transaction })
  }

  static async releaseBlockedTx(
    transactionId: number,
    releaseToUserId: number,
    transaction?: SequelizeTransacion
  ): Promise<Transaction> {
    const tx = await Transaction.findById(transactionId, {
      transaction
    })

    if (!tx) {
      throw new TransactionError(
        404,
        'No Transaction with id found for releaseBlockTx'
      )
    }

    if (tx.transactionSource != TransactionSource.BLOCK) {
      throw new Error('This is not a blocked transaction')
    }

    // Credit to user
    const releasedTx = await Transaction.create<Transaction>(
      {
        userId: releaseToUserId,
        txid: tx.txid,
        amount: Math.abs(tx.amount),
        transactionSource: TransactionSource.RELEASE,
        transactionType: TransactionType.RECEIVE,
        currencyCode: tx.currencyCode,
        confirmations: tx.confirmations
      },
      {
        transaction
      }
    )

    return releasedTx
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
