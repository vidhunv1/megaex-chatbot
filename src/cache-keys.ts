import Store from './helpers/store'
import { CONFIG } from '../config'

export default class CacheKeys {
  id: string | number
  redisClient: any

  constructor(id: string | number) {
    this.id = id
    this.redisClient = new Store().getClient()
  }

  static getIdFromKey(key: string) {
    const id = key.split(':')[1]
    if (!id || id === '')
      console.error(
        'Id is not available, maybe you passed undefined id when accessing id'
      )
    return id
  }

  static isKey(checkKey: string, actualKey: string) {
    console.log('isKey() ' + checkKey + ', ' + actualKey)
    return (
      checkKey === actualKey ||
      checkKey.split(':')[0] === actualKey ||
      checkKey.split(':')[0] === actualKey.split(':')[0]
    )
  }

  getKeys(): KeysInterface {
    const formattedId = this.id && this.id !== '' ? ':' + this.id : ''
    return {
      telegramUser: {
        // should also contain user object
        key: 'TelegramUser' + formattedId,
        expiry: 60 * 60
      },
      messageCounter: {
        key: 'TMessageCounter' + formattedId,
        expiry: 60 * 10,
        shadowKey: 'TMessageCounterShadow' + formattedId
      },
      paymentExpiryTimer: {
        key: 'PaymentExpiryTimer' + formattedId,
        shadowKey: 'PaymentExpiryShadow' + formattedId,
        expiry: CONFIG.PAYMENT_EXPIRY_S
      },
      tContext: {
        key: 'TContext' + formattedId,
        currentContext: 'currentContext',
        'Wallet.coin': 'Wallet.coin',
        'CoinSend.isInputAmount': 'CoinSend.isInputAmount',
        'CoinSend.amount': 'CoinSend.amount',
        'SendMessage.accountId': 'SendMessage.accountId',
        'EnterPayMethod.methodName': 'EnterPayMethod.methodName',
        'EnterPayMethod.fields': 'EnterPayMethod.fields',
        'Trade.minAmount': 'Trade.minAmount',
        'Trade.maxAmount': 'Trade.maxAmount',
        'Trade.isInputPrice': 'Trade.isInputPrice',
        'Trade.price': 'Trade.price',
        'Trade.paymethodId': 'Trade.paymethodId',
        'Trade.isParsePaymethod': 'Trade.isParsePaymethod',
        'Trade.editOrderId': 'Trade.editOrderId',
        expiry: CONFIG.CONTEXT_EXPIRY_S
      }
    }
  }

  async clearUserCache() {
    await this.redisClient.delAsync(this.getKeys().telegramUser.key)
  }
}
