import {Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull, Default, AutoIncrement} from 'sequelize-typescript';
import User from './user';
import MessageQueue from '../helpers/message-queue'
import Logger from '../helpers/logger'

@Table({timestamps: true, tableName: 'Wallets'})
export default class Wallet extends Model<Wallet> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column(DataType.INTEGER)
  id!: number;

  @AllowNull(false)
  @ForeignKey(() => User)
  @Column(DataType.BIGINT)
  userId!: number

  @BelongsTo(() => User)
  user!: User;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  availableBalance!: number;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  unconfirmedBalance!: number;

  @AllowNull(false)
  @Default(0.0)
  @Column(DataType.FLOAT)
  blockedBalance!: number;  

  @AllowNull(false)
  @Column
  address!: string;

  @AllowNull(false)
  @Column
  currencyCode!: string

  //calling this will create all wallets for the userId, should be called only once.
  async create(): Promise<Wallet | null> {
    let logger = (new Logger()).getLogger();

    let messageQueue = new MessageQueue();
    try { 
    let btcAddress = await messageQueue.generateBtcAddress(this.userId);
    let wallet =  await Wallet.create<Wallet>({ userId: this.userId, address: btcAddress, currencyCode: 'btc' }, {});
    return wallet;
    } catch(e) {
      logger.error("error creating bitcoin wallet: "+JSON.stringify(e));
      return null;
    }
  }
}