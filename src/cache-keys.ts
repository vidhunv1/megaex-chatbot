export default class CacheKeys {
  id: string | number
  constructor(id: string | number) {
    this.id = id;
  }

  static getIdFromKey(key: string) {
    let id = key.split(':')[1];
    if (!id || id === '')
      console.error("Id is not available, maybe you passed undefined id when accessing id")
    return id;
  }

  static isKey(checkKey: string, actualKey: string) {
    console.log("isKey() " + checkKey + ', ' + actualKey);
    return (checkKey === actualKey || checkKey.split(':')[0] === actualKey)
  }

  getKeys() {
    let formattedId = ((this.id && this.id !== '') ? ':' + this.id : '');
    return {
      telegramUser: { //should also contain user object
        key: 'TelegramUser' + formattedId,
        expiry: 60 * 60
      },
      messageCounter: {
        key: "TMessageCounter" + formattedId,
        expiry: 60 * 10,
        shadowKey: "TMessageCounterExpire" + formattedId
      },
      tContext: {
        key: "TContext",
        
      }
    }
  }

}