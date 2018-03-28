import {Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull, Unique, AutoIncrement} from 'sequelize-typescript';
import User from './user';
import RandomGenerator from '../helpers/random-generator'
import * as Bcrypt from 'bcrypt'
import * as JWT from 'jsonwebtoken';
import * as AppConfig from '../../config/app.json'
import Logger from '../helpers/logger'

@Table({timestamps: true, tableName: 'Payments'})
export default class Payment extends Model<Payment> {
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
  status!: string;

  @Column(DataType.FLOAT)
  amount!: number

  @Column
  secretHash!: string

  @AllowNull(true)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  claimant!: number

  @Column
  paymentSignature!: string

  static async newPayment(userId:number, currencyCode:string, amount:number): Promise<string> {
    let r = new RandomGenerator();
    let transactionId = await r.generateTransactionId();

    let salt = (<any>AppConfig)["hash_salt"];
    let paymentCode = await r.generatePaymentCode();
    let secretHash = await Bcrypt.hash(paymentCode, salt);

    let jwtSecret = (<any>AppConfig)["jwt_secret"];
    let paySign =  JWT.sign({userId: userId, currencyCode: currencyCode, amount: amount}, jwtSecret)
    let p = new Payment({transactionId: transactionId, secretHash: secretHash, userId: userId, currencyCode: currencyCode, amount: amount, status: 'pending', paymentSignature: paySign});
    await p.save();
    return paymentCode;
  }

  static async getBySecret(secret:string): Promise<Payment|null> {
    let logger = (new Logger()).getLogger();
    let salt = (<any>AppConfig)["hash_salt"];
    let hash:string = await Bcrypt.hash(secret, salt);
    let payment:Payment|null =  await Payment.findOne({where: {secretHash: hash}});
    if(payment == null)
      return null;
    try {
      let jwtSecret = (<any>AppConfig)["jwt_secret"];
      var decoded = JWT.verify(payment.paymentSignature, jwtSecret);
      if(decoded.userId && decoded.currencyCode && decoded.amount) {
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

  // TODO: Check and handle expired payments < 48 hours
  static async claimPayment(secret:string): Promise<{status:'alreadyClaimed'|'expired'|'processed'|'invalid', amount?:number, transactionId?:string, currencyCode?:string}> {
    let p:Payment|null = await this.getBySecret(secret);
    if(p) {
      console.log("Processing payment: "+JSON.stringify(p));
      if(false) { //check if payment has expired
        return {status: 'expired'}
      } else if(p.claimant == null) { //TODO: process the payment in DB
        return {status:'processed', amount: p.amount, transactionId: p.transactionId, currencyCode: p.currencyCode};
      } else
        return {status: 'alreadyClaimed'}
    } else {
      return {status: 'invalid'}
    }
  }
}