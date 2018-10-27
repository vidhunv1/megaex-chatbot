import {
  Table,
  Column,
  Model,
  ForeignKey,
  Unique,
  DataType,
  BelongsTo,
  PrimaryKey,
  AllowNull,
  AutoIncrement
} from "sequelize-typescript";
import User from "./user";
import { Transaction as SequelizeTransacion } from "sequelize";
import Logger from "../helpers/logger";

@Table({ timestamps: true, tableName: "Transactions" })
export default class Transaction extends Model<Transaction> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Unique
  @Column
  transactionId!: string;

  @AllowNull(false)
  @Column
  transactionType!: string;

  //All send balances are negative
  @AllowNull(false)
  @Column(DataType.FLOAT)
  amount!: number;

  @AllowNull(false)
  @Column
  confirmations!: number;

  @AllowNull(false)
  @Column(DataType.DATE)
  receivedTime!: Date;

  @AllowNull(false)
  @Column
  transactionSource!: string;

  @AllowNull(false)
  @Column
  currencyCode!: string;

  static async getTotalBalance(
    userId: number,
    currencyCode: string
  ): Promise<number> {
    // TODO: If you are paranoid, check validity of all transations from core-wallet and verify jwt for payment codes.
    // For now this should do.

    // some bug, have to parse & stringify to get sum
    let totalBalance: number = JSON.parse(
      JSON.stringify(
        await Transaction.find({
          attributes: [[Transaction.sequelize.literal("SUM(amount)"), "sum"]],
          where: { currencyCode: currencyCode, userId: userId }
        })
      )
    ).sum;
    return totalBalance;
  }

  static async transfer(
    fromUserId: number,
    toUserId: number,
    amount: number,
    currencyCode: string,
    transactionID: string,
    transaction: SequelizeTransacion
  ) {
    let balance: number = await Transaction.getTotalBalance(
      fromUserId,
      currencyCode
    );
    if (balance < amount) {
      throw new TransactionError(TransactionError.INSUFFICIENT_BALANCE);
    }
    let senderTransaction = new Transaction({
      userId: fromUserId,
      transactionId: transactionID + "-s",
      amount: -1 * amount,
      confirmations: 3,
      receivedTime: new Date(),
      transactionSource: "payment",
      transactionType: "send",
      currencyCode: currencyCode
    });
    await senderTransaction.save({ transaction: transaction });

    let receiverTransaction = new Transaction({
      userId: toUserId,
      transactionId: transactionID + "-r",
      amount: amount,
      confirmations: 3,
      receivedTime: new Date(),
      transactionSource: "payment",
      transactionType: "receive",
      currencyCode: currencyCode
    });
    await receiverTransaction.save({ transaction: transaction });
  }
}

export class TransactionError extends Error {
  public status: number;
  public static INSUFFICIENT_BALANCE = 490;

  constructor(status: number = 500, message: string = "Transaction Error") {
    super(message);
    this.name = this.constructor.name;
    let logger = new Logger().getLogger();
    logger.error(this.constructor.name + ", " + status);
    this.status = status;
  }
}
