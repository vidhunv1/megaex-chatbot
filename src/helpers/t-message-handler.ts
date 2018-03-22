import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from './telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Store from '../helpers/store'
import CacheStore from '../cache-keys'

export default class TMHandler {
  static instance: TMHandler
  constructor() {
    if(TMHandler.instance) 
      return TMHandler.instance;
    this.initCallbacks()

    TMHandler.instance = this;
  }

  initCallbacks() {}

  async getContext(id:number | string, getKeys: string[] | undefined = undefined) {
    let cacheKeys = (new CacheStore(id)).getKeys();
    const redisClient:any = (new Store()).getClient();

    let result:any = {};
    if(!getKeys) {
      let r:string[] = await redisClient.hgetallAsync(cacheKeys.tContext.key);
      for(let i=0; i<r.length; i+=2) {
        result[r[i]] = r[i+1];
      }
    } else {
      let r:string[] = await redisClient.hmgetAsync(cacheKeys.tContext.key, getKeys);
      for(let i=0; i<r.length; i++) {
        result[getKeys[i]] = r[i];
      }
    }
    return result;
  }

  async handleMessage(msg: TelegramBot.Message, user:User, tUser:TelegramUser) {
    let tBot = (new TelegramBotApi()).getBot();
    /* *** USER ONBOARDING *** */
    if(!user.isTermsAccepted) {
      if(msg.text && msg.text.startsWith('/start')) {
        tBot.sendMessage(msg.chat.id, user.__('get_started_guide %s', tUser.firstName, { parse_mode: 'Markdown' }));
      } else if(msg.text && msg.text === user.__('i_agree')) {
        await User.update(
          { isTermsAccepted: true },
          { where: { id: user.id } }
        )

        const redisClient:any = (new Store()).getClient();
        await redisClient.delAsync((new CacheStore(tUser.id)).getKeys().telegramUser.key);
        
        tBot.sendMessage(msg.chat.id, user.__('initial_message'), { 
          parse_mode: 'Markdown', 
          reply_markup: {
            keyboard: [
              [{text: user.__('wallet')}, {text: user.__('buy_sell')}],
              [{text: user.__('info')}, {text: user.__('settings')}],
            ], 
            one_time_keyboard: true,
            resize_keyboard: true
          }
        });
      } else {
        tBot.sendMessage(msg.chat.id, user.__('tc_privacy'), { 
          parse_mode: 'Markdown', 
          reply_markup: {
            keyboard: [[{text: user.__('i_agree')}]],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        });
      }
    } else {
    }
  }

}