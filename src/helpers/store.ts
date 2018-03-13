import * as Redis from 'redis'
import { redisKeys } from '../keys'
import * as Bluebird from 'bluebird'

import TelegramUser from '../models/telegram_user'
import User from '../models/user'
export default class Store {
  static instance:Store;
  client!:any;
  pub!:any;
  sub!:any;
  constructor() {
    if(Store.instance)
      return Store.instance;
    
    console.log("Initializing redis pub/sub keyspace-events");
    Bluebird.promisifyAll(Redis.RedisClient.prototype);
    Bluebird.promisifyAll(Redis.Multi.prototype);
    this.client = Redis.createClient();
    this.pub = Redis.createClient();
    this.sub = Redis.createClient();

    this.pub.send_command('config', ['set','notify-keyspace-events','Ex'], (_:any, r:any) => {
      const expired_subKey = '__keyevent@'+0+'__:expired'
      let sub = this.sub;
      let client = this.client;
      this.sub.subscribe(expired_subKey, function() {
       console.log(' [i] Subscribed to "'+expired_subKey+'" event channel : '+r)
       sub.on('message', async function (_:any,msg:any) {
         if(redisKeys().isKey(msg, redisKeys().messageCounter.shadowKey)) {
           let telegramId = redisKeys().getIdFromKey(msg);
           let cacheCount:number = parseInt(await client.getAsync(redisKeys(telegramId).messageCounter.key));
           const tUser = await TelegramUser.findById(telegramId, { include: [{ model: User }] });
           if(tUser) {
             if(cacheCount>0) {
               tUser.user.updateAttributes({ messageCount: (cacheCount+tUser.user.messageCount) });
             }
           }
         }
       })
      })
    })
    Store.instance = this;
  }

  getClient(): any {
    return this.client;
  }
}