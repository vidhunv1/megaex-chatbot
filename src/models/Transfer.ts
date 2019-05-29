import {
  Table,
  Column,
  Model,
  ForeignKey,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  Unique,
  AutoIncrement
} from 'sequelize-typescript'
// import * as moment from 'moment'
import { User, Transaction } from '.'
import RandomGenerator from '../lib/RandomGenerator'
import * as Bcrypt from 'bcrypt'
import logger from '../modules/Logger'
import { cacheConnection } from '../modules'
import { CONFIG } from '../config'
// import { TransactionError } from './Transaction'
// import { WalletError } from './Wallet'
import { CryptoCurrency } from '../constants/currencies'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'

enum TransferStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}

@Table({ timestamps: true, tableName: 'Transfers' })
export class Transfer extends Model<Transfer> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User

  @AllowNull(false)
  @Unique
  @Column
  transactionId!: string

  @Column
  currencyCode!: CryptoCurrency

  @Column
  status!: TransferStatus

  @Column(DataType.FLOAT)
  amount!: number

  @AllowNull(true)
  @Column
  secretHash!: string

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  receiverUserId!: number

  static async newPayment(
    userId: number,
    currencyCode: CryptoCurrency,
    amount: number
  ): Promise<string | null> {
    const availableBalance = await Transaction.getAvailableBalance(
      userId,
      currencyCode
    )

    if (availableBalance < amount) {
      throw new TransferError(TransferError.INSUFFICIENT_BALANCE)
    }
    const r = new RandomGenerator()
    const transactionId = await r.generateTransactionId()
    const paymentCode = await r.generatePaymentCode()

    const secretHash = await Bcrypt.hash(paymentCode, 6)

    try {
      const payment = await Transfer.create<Transfer>({
        transactionId: transactionId,
        secretHash: secretHash,
        userId: userId,
        currencyCode: currencyCode,
        amount: amount,
        status: TransferStatus.PENDING
      })

      const paymentExpiryKey = CacheHelper.getKeyForId(
        CacheKey.PaymentExpiry,
        payment.id
      )
      await cacheConnection.getClient.setAsync(
        paymentExpiryKey,
        '',
        'EX',
        parseInt(CONFIG.PAYMENT_EXPIRY_S)
      )
      return paymentCode
    } catch (e) {
      logger.error(
        'Transaction error in creating payment link: ' + JSON.stringify(e)
      )
      throw e
    }
  }

  // static async claimPayment(
  //   secret: string,
  //   claimantUserId: number
  // ): Promise<{
  //   amount: number
  //   transactionId: string
  //   currencyCode: string
  //   userId: string | number
  // }> {
  //   const p: Transfer | null = await this.getBySecret(secret)

  //   if (!p) throw new TransferError(TransferError.NOT_FOUND)
  //   if (p.claimant) throw new TransferError(TransferError.CLAIMED)
  //   if (p.userId === claimantUserId)
  //     // TODO: self payment link, show details about payment link
  //     throw new TransferError(TransferError.SELF_CLAIM)
  //   if (moment().diff(p.createdAt, 'seconds') >= CONFIG.PAYMENT_EXPIRY_S)
  //     // expiry
  //     throw new TransferError(TransferError.EXPIRED)

  //   try {
  //     await this.sequelize.transaction(async function(t) {
  //       if (!p) throw new TransferError(TransferError.NOT_FOUND)
  //       try {
  //         await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount, t)
  //       } catch (e) {
  //         if (e instanceof WalletError) {
  //           if ((e.status = WalletError.INSUFFICIENT_BALANCE)) {
  //             throw new TransferError(TransferError.INSUFFICIENT_BALANCE)
  //           }
  //         }
  //       }

  //       await Transaction.transfer(
  //         p.userId,
  //         claimantUserId,
  //         p.amount,
  //         p.currencyCode,
  //         p.transactionId,
  //         t
  //       )

  //       // unset expiry on paymentlink
  //       const cacheKeys = new CacheKeys(p.id).getKeys()
  //       cacheClient.getClient.delAsync(cacheKeys.paymentExpiryTimer.shadowKey)

  //       return await p.updateAttributes(
  //         { status: 'claimed', claimant: claimantUserId },
  //         { transaction: t }
  //       )
  //     })
  //     return {
  //       amount: p.amount,
  //       transactionId: p.transactionId + '-r',
  //       currencyCode: p.currencyCode,
  //       userId: p.userId
  //     }
  //   } catch (e) {
  //     if (e instanceof TransactionError) {
  //       if (e.status === TransactionError.INSUFFICIENT_BALANCE) {
  //         throw new TransferError(TransferError.INSUFFICIENT_BALANCE)
  //       }
  //     }
  //     throw new TransferError()
  //   }
  // }

  // static async deletePayment(secret: string, userId: number): Promise<boolean> {
  //   const p: Transfer | null = await this.getBySecret(secret)
  //   if (!p) throw new TransferError(TransferError.NOT_FOUND)
  //   if (p.userId != userId) throw new TransferError(TransferError.UNAUTHORIZED)

  //   try {
  //     await p.updateAttributes({ paymentSignature: '', status: 'deleted' })
  //     await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount)
  //   } catch (e) {
  //     throw new TransferError()
  //   }
  //   return true
  // }

  // static async getBySecret(secret: string): Promise<Transfer | null> {
  //   const salt = CONFIG.HASH_SALT
  //   const hash: string = await Bcrypt.hash(secret, salt)
  //   const payment: Transfer | null = await Transfer.findOne({
  //     where: { secretHash: hash }
  //   })
  //   if (payment == null) return null
  //   try {
  //     const jwtSecret = CONFIG.JWT_SECRET
  //     const decoded = JWT.verify(payment.transferSignature, jwtSecret) as any
  //     if (decoded.userId && decoded.currencyCode && decoded.amount) {
  //       payment.userId = decoded.userId
  //       payment.currencyCode = decoded.currencyCode
  //       payment.amount = decoded.amount
  //       return payment
  //     } else {
  //       return null
  //     }
  //   } catch (err) {
  //     if (err.name === 'JsonWebTokenError')
  //       logger.error('Error in verifying payment')
  //     return null
  //   }
  // }

  // public static async deletePaymentIfExpired(
  //   paymentId: number
  // ): Promise<Transfer | null> {
  //   if (paymentId) {
  //     const p: Transfer | null = await Transfer.findOne({
  //       where: { id: paymentId }
  //     })
  //     if (p && p.status === 'pending') {
  //       await p.updateAttributes({
  //         paymentSignature: '',
  //         status: 'expired',
  //         secretHash: ''
  //       })
  //       try {
  //         await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount)
  //         return p
  //       } catch (e) {
  //         logger.error('error occurred in wallet')
  //         throw new Error()
  //       }
  //     } else {
  //       throw new TransferError(TransferError.NOT_FOUND)
  //     }
  //   }
  //   return null
  // }

  // public static async deleteExpiredPayments(): Promise<boolean> {
  //   const p: Transfer[] | null = await Transfer.findAll({
  //     where: {
  //       status: 'pending',
  //       createdAt: {
  //         $lte: moment()
  //           .subtract(CONFIG.PAYMENT_EXPIRY_S, 's')
  //           .toISOString()
  //       }
  //     }
  //   })
  //   console.log('Deleting expired payments: ' + JSON.stringify(p))
  //   for (let i = 0; i < p.length; i++) {
  //     await Transfer.deletePaymentIfExpired(p[i].id)
  //   }
  //   return false
  // }
}

export class TransferError extends Error {
  public status: number
  public static EXPIRED = 410
  public static INSUFFICIENT_BALANCE = 490
  public static CLAIMED = 409
  public static NOT_FOUND = 404
  public static DELETED = 405
  public static SELF_CLAIM = 411
  public static UNAUTHORIZED = 401

  constructor(status: number = 500, message: string = 'Payment Error') {
    super(message)
    this.name = this.constructor.name
    logger.error(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Transfer
