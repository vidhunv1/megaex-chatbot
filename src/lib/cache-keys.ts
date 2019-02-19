import { CONFIG } from '../config'
import cacheConnection from '../modules/cache'
import logger from '../modules/logger'

export enum ROOT_KEYS {
  Account = 't-account',
  MessageCounter = 't-message-counter',
  PaymentExpiryTimer = 't-payment-expiry',
  CurrentContext = 't-current-context',
  ContextValues = 't-context-values' // Hash map for context values
}

// Use 0 is for infinite expiration
export const ROOT_KEY_EXPIRY: Record<ROOT_KEYS, number> = {
  [ROOT_KEYS.Account]: 60 * 60,
  [ROOT_KEYS.MessageCounter]: 60 * 10, // Instead of 0, use a fixed value so the values can be persisted on DB after some time (maybe on 10 mins?)
  [ROOT_KEYS.PaymentExpiryTimer]: CONFIG.PAYMENT_EXPIRY_S,
  [ROOT_KEYS.CurrentContext]: 0,
  [ROOT_KEYS.ContextValues]: 0
}

export const KEY_SEPERATOR = ':'

export class CacheKeys {
  id: string | number

  constructor(id: string | number) {
    this.id = id
  }

  static getIdFromKey(key: string) {
    const id = key.split(':')[1]
    if (!id || id === '') {
      logger.error(
        'Id is not available, maybe you passed undefined id when accessing id'
      )
      throw new Error('Id not passed in CacheKeys')
    }
    return id
  }

  static isKey(checkKey: string, actualKey: string) {
    return (
      checkKey === actualKey ||
      checkKey.split(KEY_SEPERATOR)[0] === actualKey ||
      checkKey.split(KEY_SEPERATOR)[0] === actualKey.split(KEY_SEPERATOR)[0]
    )
  }

  getKeys(): KeysInterface {
    const formattedId = this.id && this.id !== '' ? ':' + this.id : ''
    return {
      telegramAccount: {
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
        expiry: 0
      }
    }
  }

  async clearUserCache() {
    const cacheClient = cacheConnection.getClient
    await cacheClient.delAsync(this.getKeys().telegramAccount.key)
  }
}
