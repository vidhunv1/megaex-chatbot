import Store from './helpers/store'
import * as AppConfig from '../config/app.json'
let env = process.env.NODE_ENV || 'development';

export default class CacheKeys {
  id: string | number
  redisClient:any

  constructor(id: string | number) {
    this.id = id;
    this.redisClient = (new Store()).getClient();
  }

  static getIdFromKey(key: string) {
    let id = key.split(':')[1];
    if (!id || id === '')
      console.error("Id is not available, maybe you passed undefined id when accessing id")
    return id;
  }

  static isKey(checkKey: string, actualKey: string) {
    console.log("isKey() " + checkKey + ', ' + actualKey);
    return (checkKey === actualKey || checkKey.split(':')[0] === actualKey || checkKey.split(':')[0] === actualKey.split(':')[0])
  }

  getKeys():KeysInterface {
    let formattedId = ((this.id && this.id !== '') ? ':' + this.id : '');
    return {
      telegramUser: { //should also contain user object
        key: 'TelegramUser' + formattedId,
        expiry: 60 * 60
      },
      messageCounter: {
        key: "TMessageCounter" + formattedId,
        expiry: 60 * 10,
        shadowKey: "TMessageCounterShadow" + formattedId
      },
      paymentExpiryTimer: {
        key: "PaymentExpiryTimer" + formattedId,
        shadowKey: "PaymentExpiryShadow" + formattedId,
        expiry: (<any>AppConfig)[env]["payment_expiry"]
      },
      tContext: {
        key: "TContext" + formattedId,
        currentContext: "currentContext",
        "Wallet.coin": "Wallet.coin",
        "CoinSend.isInputAmount": "CoinSend.isInputAmount",
        "CoinSend.amount": "CoinSend.amount",
        "SendMessage.accountId": "SendMessage.accountId",
        "EnterPayMethod.methodName": "EnterPayMethod.methodName",
        "EnterPayMethod.fields": "EnterPayMethod.fields",
        expiry: (<any>AppConfig)[env]["context_expiry"]
      }
    }
  }

  async clearUserCache() {
    await this.redisClient.delAsync(this.getKeys().telegramUser.key);
  }

}