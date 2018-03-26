import { Table, Column, Model, ForeignKey, DataType, BelongsTo, PrimaryKey, AllowNull, Default, AutoIncrement } from 'sequelize-typescript';
import User from './user';
import MessageQueue from '../helpers/message-queue'
import Logger from '../helpers/logger'

@Table({ timestamps: true, tableName: 'Wallets' })
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
  async create(): Promise<Wallet[] | null> {
    let logger = (new Logger()).getLogger();

    let messageQueue = new MessageQueue();
    try {
      let wallets = [];

      //generate btc address
      let btcAddress = await messageQueue.generateBtcAddress(this.userId);
      wallets.push(await Wallet.create<Wallet>({ userId: this.userId, address: btcAddress, currencyCode: Wallet.getCurrencyCodes()[0] }, {}));

      //generate testnet btc address
      let btcTestAddress = await messageQueue.generateBtcAddress(this.userId);
      wallets.push(await Wallet.create<Wallet>({ userId: this.userId, address: btcTestAddress, currencyCode: Wallet.getCurrencyCodes()[0] }, {}));

      return wallets;
    } catch (e) {
      logger.error("error creating bitcoin wallet: " + JSON.stringify(e));
      return null;
    }
  }

  async newAddress(): Promise<string | null> {
    let messageQueue = new MessageQueue();
    let logger = (new Logger()).getLogger();
    try {
      if (this.currencyCode === 'btc') {
        let btcAddress = await messageQueue.generateBtcAddress(this.userId);
        await this.updateAttributes({ address: btcAddress })
        return btcAddress;
      } else if (this.currencyCode === 'tbtc') {
        let btcAddress = await messageQueue.generateBtcAddress(this.userId);
        await this.updateAttributes({ address: btcAddress })
        return btcAddress;
      }
      return null;
    } catch (e) {
      logger.error("Error generating new address: " + JSON.stringify(this) + ", error: " + JSON.stringify(e));
      return null;
    }
  }

  static getCurrencyCodes() {
    return ['btc', 'tbtc'];
  }
}