import { Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull, Unique, AutoIncrement } from 'sequelize-typescript';
import * as moment from 'moment'
import User from './user';
import Wallet, { WalletError } from '../models/wallet'
import Transaction, { TransactionError } from './transaction'
import RandomGenerator from '../helpers/random-generator'
import * as Bcrypt from 'bcrypt'
import * as JWT from 'jsonwebtoken';
import * as AppConfig from '../../config/app.json'
import Logger from '../helpers/logger'
import Store from '../helpers/store'
import CacheStore from '../cache-keys'
let env = process.env.NODE_ENV || 'development';
console.log("Running in environment: "+env);

@Table({ timestamps: true, tableName: 'Transfers' })
export default class Transfer extends Model<Transfer> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.BIGINT)
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Unique
  @Column
  transactionId!: string

  @Column
  currencyCode!: string;

  @Column
  status!: 'pending' | 'claimed' | 'expired';

  @Column(DataType.FLOAT)
  amount!: number

  @AllowNull(true)
  @Column
  secretHash!: string

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  claimant!: number

  @AllowNull(true)
  @Column
  transferSignature!: string

  static async newPayment(userId: number, currencyCode: string, amount: number): Promise<{ paymentCode?: string | null }> {
    let logger = (new Logger()).getLogger();
    let wallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance', 'id', 'blockedBalance'], where: { currencyCode: currencyCode, userId: userId } });
    if (!wallet)
      throw new TransferError();

    if (wallet.availableBalance < amount)
      throw new TransferError(TransferError.INSUFFICIENT_BALANCE);

    let r = new RandomGenerator();
    let transactionId = await r.generateTransactionId();
    let salt = (<any>AppConfig)[env]["hash_salt"];
    let paymentCode = await r.generatePaymentCode();
    let secretHash = await Bcrypt.hash(paymentCode, salt);
    let jwtSecret = (<any>AppConfig)[env]["jwt_secret"];
    let paySign = JWT.sign({ userId: userId, currencyCode: currencyCode, amount: amount }, jwtSecret)

    try {
      let payment: Transfer = await this.sequelize.transaction(async function (t) {
        if (!wallet)
          throw Error();

        await Wallet.blockBalance(userId, currencyCode, amount, t);
        
        let p = new Transfer({ transactionId: transactionId, secretHash: secretHash, userId: userId, currencyCode: currencyCode, amount: amount, status: 'pending', transferSignature: paySign });
        await p.save({ transaction: t });
        if (!p)
          throw Error();

        return p;
      });
      let redisClient = (new Store()).getClient();
      let cacheKeys = (new CacheStore(payment.id)).getKeys();
      await redisClient.setAsync(cacheKeys.paymentExpiryTimer.key, payment.id);
      await redisClient.setAsync(cacheKeys.paymentExpiryTimer.shadowKey, '', 'EX', cacheKeys.paymentExpiryTimer.expiry);
      return { paymentCode: paymentCode };
    } catch (e) {
      logger.error("Transaction error in creating payment link: " + JSON.stringify(e));
      throw new TransferError();
    }
  }

  static async claimPayment(secret: string, claimantUserId: number): Promise<{ amount: number, transactionId: string, currencyCode: string, userId: string|number }> {
    let p: Transfer | null = await this.getBySecret(secret);

    if (!p)
      throw new TransferError(TransferError.NOT_FOUND);
    if (p.claimant)
      throw new TransferError(TransferError.CLAIMED);
    if (p.userId === claimantUserId) //TODO: self payment link, show details about payment link
      throw new TransferError(TransferError.SELF_CLAIM);
    if (moment().diff(p.createdAt, 'seconds') >= (<any>AppConfig)[env]["payment_expiry"]) //expiry
      throw new TransferError(TransferError.EXPIRED)

    try {
      await this.sequelize.transaction(async function (t) {
        if (!p)
          throw new TransferError(TransferError.NOT_FOUND);
        try {
          await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount, t);
        } catch(e) {
          if(e instanceof WalletError) {
            if(e.status = WalletError.INSUFFICIENT_BALANCE) {
              throw new TransferError(TransferError.INSUFFICIENT_BALANCE);
            }
          }
        }
        
        await Transaction.transfer(p.userId, claimantUserId, p.amount, p.currencyCode, p.transactionId, t);

        // unset expiry on paymentlink
        let redisClient = (new Store()).getClient();
        let cacheKeys = (new CacheStore(p.id)).getKeys();
        redisClient.delAsync(cacheKeys.paymentExpiryTimer.shadowKey);

        return await p.updateAttributes({ status: 'claimed', claimant: claimantUserId }, { transaction: t });
      });
      return { amount: p.amount, transactionId: p.transactionId + '-r', currencyCode: p.currencyCode, userId: p.userId }
    } catch (e) {
      if(e instanceof TransactionError) {
        if(e.status === TransactionError.INSUFFICIENT_BALANCE) {
          throw new TransferError(TransferError.INSUFFICIENT_BALANCE);
        }
      }
      throw new TransferError();
    }
  }

  static async deletePayment(secret: string, userId: number): Promise<boolean> {
    let p: Transfer | null = await this.getBySecret(secret);
    if (!p)
      throw new TransferError(TransferError.NOT_FOUND);
    if (p.userId != userId)
      throw new TransferError(TransferError.UNAUTHORIZED);

    try {
      await p.updateAttributes({ paymentSignature: '', status: 'deleted' });
      await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount);
    } catch(e) {
      throw new TransferError();
    }
    return true;
  }

  static async getBySecret(secret: string): Promise<Transfer | null> {
    let logger = (new Logger()).getLogger();
    let salt = (<any>AppConfig)[env]["hash_salt"];
    let hash: string = await Bcrypt.hash(secret, salt);
    let payment: Transfer | null = await Transfer.findOne({ where: { secretHash: hash } });
    if (payment == null)
      return null;
    try {
      let jwtSecret = (<any>AppConfig)[env]["jwt_secret"];
      var decoded = JWT.verify(payment.transferSignature, jwtSecret);
      if (decoded.userId && decoded.currencyCode && decoded.amount) {
        payment.userId = decoded.userId;
        payment.currencyCode = decoded.currencyCode;
        payment.amount = decoded.amount;
        return payment;
      } else {
        return null;
      }
    } catch (err) {
      if (err.name === "JsonWebTokenError")
        logger.error("Error in verifying payment");
      return null;
    }
  }

  public static async deletePaymentIfExpired(paymentId: number):Promise<Transfer|null> {
    let logger = (new Logger()).getLogger();
    if (paymentId) {
      let p: Transfer | null = await Transfer.findOne({ where: { id: paymentId } });
      if (p && p.status==='pending') {
        await p.updateAttributes({ paymentSignature: '', status: 'expired', secretHash: ''});
        try {
          await Wallet.unblockBalance(p.userId, p.currencyCode, p.amount);
          return p;
        } catch(e) {
          logger.error("error occurred in wallet");
          throw new Error();
        }
      } else {
        throw new TransferError(TransferError.NOT_FOUND);
      }
    }
    return null;
  }

  public static async deleteExpiredPayments():Promise<boolean> {
    let p:Transfer[]|null = await Transfer.findAll({where: {status: 'pending', createdAt: {$lte: moment().subtract((<any>AppConfig)[env]["payment_expiry"], 's').toISOString()}}});
    console.log("Deleting expired payments: "+JSON.stringify(p));
    for(let i=0; i<p.length; i++) {
      await Transfer.deletePaymentIfExpired(p[i].id);
    }
    return false;
  }
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
    super(message);
    this.name = this.constructor.name;
    let logger = (new Logger()).getLogger();
    logger.error(this.constructor.name + ", " + status);
    this.status = status;
  }
};