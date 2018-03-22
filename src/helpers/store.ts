import * as Redis from 'redis'
import CacheKeys from '../cache-keys'
import * as Bluebird from 'bluebird'
import * as RedisConfig from '../../config/redis.json'
import Logger from '../helpers/logger'

var env = process.env.NODE_ENV || 'development';

import TelegramUser from '../models/telegram_user'
import User from '../models/user'
export default class Store {
  static instance: Store;
  client!: any;
  pub!: any;
  sub!: any;
  constructor() {
    if (Store.instance)
      return Store.instance;

    let logger:any = (new Logger()).getLogger();
    logger.info('Initializing redis & redis pub/sub keyspace-events using '+env+' ');

    Bluebird.promisifyAll(Redis.RedisClient.prototype);
    Bluebird.promisifyAll(Redis.Multi.prototype);
    let options = { host: (<any>RedisConfig)[env]['host'], port: (<any>RedisConfig)[env]['port'] }
    this.client = Redis.createClient(options);
    this.pub = Redis.createClient(options);
    this.sub = Redis.createClient(options);

    (async () => {
      await this.client.select((<any>RedisConfig)[env]['database'], function () { });
      await this.pub.select((<any>RedisConfig)[env]['database'], function () { });
      await this.sub.select((<any>RedisConfig)[env]['database'], function () { });
    })().catch(err => {
      console.error(err);
    })
      .then(_ => {
        this.pub.send_command('config', ['set', 'notify-keyspace-events', 'Ex'], (_: any, r: any) => {
          const expired_subKey = '__keyevent@' + 0 + '__:expired'
          let sub = this.sub;
          let client = this.client;
          this.sub.subscribe(expired_subKey, function () {
            logger.info(' [i] Subscribed to "' + expired_subKey + '" event channel : ' + r)
            sub.on('message', async function (_: any, msg: any) {
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
              }
            })
          })
        })
        Store.instance = this;
      })
  }

  getClient(): any {
    return this.client;
  }

  async close() {
    let logger:any = (new Logger()).getLogger();
    logger.info("Closeing redis connection");
    return this.client.quit();
  }
}
