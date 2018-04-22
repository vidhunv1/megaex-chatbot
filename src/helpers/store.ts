import * as Redis from 'redis'
import CacheKeys from '../cache-keys'
import * as Bluebird from 'bluebird'
import * as RedisConfig from '../../config/redis.json'
import Logger from '../helpers/logger'
import Transfer from '../models/transfer'
import NotificationManager from './notification-manager'
import TelegramBotApi from '../helpers/telegram-bot-api'
import { keyboardMenu } from '../t-conversation/defaults';
var env = process.env.NODE_ENV || 'development';

import TelegramUser from '../models/telegram_user'
import User from '../models/user'
export default class Store {
  static instance: Store;
  client!: any;
  pub!: any;
  sub!: any;
  notificationManager!:NotificationManager;
  constructor() {
    if (Store.instance)
      return Store.instance;

    let logger: any = (new Logger()).getLogger();
    logger.info('Initializing redis & redis pub/sub keyspace-events using ' + env + ' ');

    Bluebird.promisifyAll(Redis.RedisClient.prototype);
    Bluebird.promisifyAll(Redis.Multi.prototype);
    let options = { host: (<any>RedisConfig)[env]['host'], port: (<any>RedisConfig)[env]['port'] }
    this.client = Redis.createClient(options);
    this.pub = Redis.createClient(options);
    this.sub = Redis.createClient(options);
    this.notificationManager = new NotificationManager();
    Store.instance = this;
  }

  async initSub() {
    let logger: any = (new Logger()).getLogger();
    let tBot = (new TelegramBotApi()).getBot();
    try {
      await this.client.select((<any>RedisConfig)[env]['database'], function () { });
      await this.pub.select((<any>RedisConfig)[env]['database'], function () { });
      await this.sub.select((<any>RedisConfig)[env]['database'], function () { });

      await this.pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], async (_: any, r: any) => {
        const expired_subKey = '__keyevent@' + 0 + '__:expired'
        let sub = this.sub;
        let client = this.client;
        let _this = this;
        await this.sub.subscribe(expired_subKey, function () {
          logger.info(' [i] Subscribed to "' + expired_subKey + '" event channel : ' + r)
          sub.on('message', async function (_: any, msg: any) {
            console.log("KEY EXPIRED: " + msg);
            if (CacheKeys.isKey(msg, (new CacheKeys(1)).getKeys().messageCounter.shadowKey)) {
              let telegramId = CacheKeys.getIdFromKey(msg);
              let rKeys = new CacheKeys(telegramId).getKeys();
              let cacheCount: number = parseInt(await client.getAsync(rKeys.messageCounter.key));
              const tUser = await TelegramUser.findById(telegramId, { include: [{ model: User }] });
              if (tUser) {
                if (cacheCount > 0) {
                  tUser.user.updateAttributes({ messageCount: (cacheCount + tUser.user.messageCount) });
                }
              }
            } else if(CacheKeys.isKey(msg, (new CacheKeys(1).getKeys().paymentExpiryTimer.shadowKey))) {
              // delete expired payment and notify
              let paymentId: number = parseInt(CacheKeys.getIdFromKey(msg));
              try {
                let payment = await Transfer.deletePaymentIfExpired(paymentId);
                if(payment) {
                  await _this.notificationManager.sendNotification(NotificationManager.NOTIF.PAYMENT_EXPIRED, 
                    {currencyCode: payment.currencyCode, amount: payment.amount, userId: payment.userId});
                }
              } catch(e) {
                logger.error("Error occurred in deleting expired payment: "+paymentId+", "+JSON.stringify(e));
              }
              } else if(CacheKeys.isKey(msg, (new CacheKeys(1).getKeys().tContext.key))) {
                let telegramId = CacheKeys.getIdFromKey(msg);
                let tUser:TelegramUser|null = await TelegramUser.findOne({where: {id: telegramId}, include: [ {model: User} ]});
                if(tUser) {
                  tBot.sendMessage(telegramId, tUser.user.__('context_action_expired'), {
                    parse_mode: 'Markdown',
                    reply_markup: {
                      keyboard: keyboardMenu(tUser.user),
                      one_time_keyboard: false,
                      resize_keyboard: true
                    }
                  });
                }
              }
            })
        })
      })
    } catch (e) {
      logger.error("Error initializing redis subscripbtion expiry");
    }
  }

  getClient(): any {
    return this.client;
  }

  async close() {
    let logger: any = (new Logger()).getLogger();
    logger.info("Closeing redis connection");
    return this.client.quit();
  }
}
