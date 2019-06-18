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
import * as moment from 'moment'
import { User, Transaction } from '.'
import RandomGenerator from '../lib/RandomGenerator'
import { logger } from 'modules'
import { cacheConnection } from '../modules'
import { CONFIG } from '../config'
import { CryptoCurrency } from '../constants/currencies'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import crypto = require('crypto')

enum TransferStatus {
  PENDING = 'PENDING',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED'
}

@Table({ timestamps: true, tableName: 'Transfers', paranoid: true })
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
      throw new TransferError(TransferErrorType.INSUFFICIENT_BALANCE)
    }
    const r = new RandomGenerator()
    const transactionId = await r.generateTransactionId()
    const paymentCode = await r.generatePaymentCode()

    const secretHash = crypto
      .createHash('sha256')
      .update(paymentCode)
      .digest('base64')

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

  static async claimPayment(
    secret: string,
    receiverUserId: number
  ): Promise<Transfer> {
    const payment: Transfer | null = await this.getBySecret(secret)

    // Error invalid code
    if (!payment) {
      throw new TransferError(TransferErrorType.INVALID_CODE)
    }
    // expiry
    if (
      moment().diff(payment.createdAt, 'seconds') >=
        parseInt(CONFIG.PAYMENT_EXPIRY_S) ||
      payment.status === TransferStatus.EXPIRED
    ) {
      throw new TransferError(TransferErrorType.EXPIRED)
    }
    // Error, self created code
    if (payment.userId === receiverUserId) {
      throw new TransferError(TransferErrorType.SELF_CLAIM)
    }
    // code already used
    if (
      payment.status === TransferStatus.CLAIMED ||
      payment.receiverUserId != null
    ) {
      throw new TransferError(TransferErrorType.ALREADY_CLAIMED)
    }
    // Creator has insufficient balance
    const creatorBalance = await Transaction.getAvailableBalance(
      payment.userId,
      payment.currencyCode
    )
    if (creatorBalance < payment.amount) {
      throw new TransferError(TransferErrorType.INSUFFICIENT_BALANCE)
    }

    try {
      return await this.sequelize.transaction(async function(t) {
        await Transaction.transfer(
          payment.userId,
          receiverUserId,
          payment.amount,
          payment.currencyCode,
          payment.id + '',
          t
        )

        const paymentExpiryKey = CacheHelper.getKeyForId(
          CacheKey.PaymentExpiry,
          payment.id
        )

        cacheConnection.getClient.delAsync(paymentExpiryKey)

        return await payment.updateAttributes(
          { status: TransferStatus.CLAIMED, receiverUserId: receiverUserId },
          { transaction: t }
        )
      })
    } catch (err) {
      logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)))
      throw new TransferError(TransferErrorType.TRANSACTION_ERROR)
    }
  }

  static async getBySecret(secret: string): Promise<Transfer | null> {
    const hash: string = crypto
      .createHash('sha256')
      .update(secret)
      .digest('base64')

    const payment: Transfer | null = await Transfer.findOne({
      where: { secretHash: hash, status: TransferStatus.PENDING }
    })
    return payment
  }

  static async deletePayment(id: number): Promise<Transfer | null> {
    const pm = await Transfer.findById(id)
    await Transfer.destroy({
      where: {
        id
      }
    })

    return pm
  }
}

export enum TransferErrorType {
  EXPIRED = 410,
  INSUFFICIENT_BALANCE = 490,
  ALREADY_CLAIMED = 409,
  SELF_CLAIM = 411,
  INVALID_CODE = 401,
  TRANSACTION_ERROR = 500
}
export class TransferError extends Error {
  public status: number

  constructor(
    status: TransferErrorType = TransferErrorType.TRANSACTION_ERROR,
    message: string = 'Payment Error'
  ) {
    super(message)
    this.name = this.constructor.name
    logger.warn(this.constructor.name + ', ' + status)
    this.status = status
  }
}

export default Transfer
