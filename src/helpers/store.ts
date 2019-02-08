import * as Redis from 'redis'
import CacheKeys from '../cache-keys'
import * as Bluebird from 'bluebird'
import Logger from '../helpers/logger'
import Transfer from '../models/transfer'
import NotificationManager from './notification-manager'
import TelegramBotApi from '../helpers/telegram-bot-api'
import { keyboardMenu } from '../t-conversation/defaults'
import { CONFIG } from '../../config'

import TelegramUser from '../models/telegram_user'
import User from '../models/user'
export default class Store {
  static instance: Store
  client!: any
  pub!: any
  sub!: any
  notificationManager!: NotificationManager
  constructor() {
    if (Store.instance) return Store.instance

    const logger: any = new Logger().getLogger()
    logger.info(
      'Initializing redis & redis pub/sub keyspace-events using ' + CONFIG.NODE_ENV + ' '
    )

    Bluebird.promisifyAll(Redis.RedisClient.prototype)
    Bluebird.promisifyAll(Redis.Multi.prototype)
    const options = {
      host: CONFIG.REDIS_HOST,
      port: CONFIG.REDIS_PORT ? parseInt(CONFIG.REDIS_PORT) : undefined
    }
    this.client = Redis.createClient(options)
    this.pub = Redis.createClient(options)
    this.sub = Redis.createClient(options)
    this.notificationManager = new NotificationManager()
    Store.instance = this
  }

  async initSub() {
    const logger: any = new Logger().getLogger()
    const tBot = new TelegramBotApi().getBot()
    try {
      await this.client.select(
        CONFIG.REDIS_DATABASE,
        function() {}
      )
      await this.pub.select(CONFIG.REDIS_DATABASE, function() {})
      await this.sub.select(CONFIG.REDIS_DATABASE, function() {})

      await this.pub.send_command(
        'config',
        ['set', 'notify-keyspace-events', 'Ex'],
        async (_: any, r: any) => {
          const expired_subKey = '__keyevent@' + 0 + '__:expired'
          const sub = this.sub
          const client = this.client
          const _this = this
          await this.sub.subscribe(expired_subKey, function() {
            logger.info(
              " [i] Subscribed to '' + expired_subKey + '' event channel : " + r
            )
            sub.on('message', async function(_: any, msg: any) {
              console.log('KEY EXPIRED: ' + msg)
              if (
                CacheKeys.isKey(
                  msg,
                  new CacheKeys(1).getKeys().messageCounter.shadowKey
                )
              ) {
                const telegramId = CacheKeys.getIdFromKey(msg)
                const rKeys = new CacheKeys(telegramId).getKeys()
                const cacheCount: number = parseInt(
                  await client.getAsync(rKeys.messageCounter.key)
                )
                const tUser = await TelegramUser.findById(telegramId, {
                  include: [{ model: User }]
                })
                if (tUser) {
                  if (cacheCount > 0) {
                    tUser.user.updateAttributes({
                      messageCount: cacheCount + tUser.user.messageCount
                    })
                  }
                }
              } else if (
                CacheKeys.isKey(
                  msg,
                  new CacheKeys(1).getKeys().paymentExpiryTimer.shadowKey
                )
              ) {
                // delete expired payment and notify
                const paymentId: number = parseInt(CacheKeys.getIdFromKey(msg))
                try {
                  const payment = await Transfer.deletePaymentIfExpired(
                    paymentId
                  )
                  if (payment) {
                    await _this.notificationManager.sendNotification(
                      NotificationManager.NOTIF.PAYMENT_EXPIRED,
                      {
                        currencyCode: payment.currencyCode,
                        amount: payment.amount,
                        userId: payment.userId
                      }
                    )
                  }
                } catch (e) {
                  logger.error(
                    'Error occurred in deleting expired payment: ' +
                      paymentId +
                      ', ' +
                      JSON.stringify(e)
                  )
                }
              } else if (
                CacheKeys.isKey(msg, new CacheKeys(1).getKeys().tContext.key)
              ) {
                const telegramId = CacheKeys.getIdFromKey(msg)
                const tUser: TelegramUser | null = await TelegramUser.findOne({
                  where: { id: telegramId },
                  include: [{ model: User }]
                })
                if (tUser) {
                  tBot.sendMessage(
                    telegramId,
                    tUser.user.__('context_action_expired'),
                    {
                      parse_mode: 'Markdown',
                      reply_markup: {
                        keyboard: keyboardMenu(tUser.user),
                        one_time_keyboard: false,
                        resize_keyboard: true
                      }
                    }
                  )
                }
              }
            })
          })
        }
      )
    } catch (e) {
      logger.error('Error initializing redis subscripbtion expiry')
    }
  }

  getClient(): any {
    return this.client
  }

  async close() {
    const logger: any = new Logger().getLogger()
    logger.info('Closing redis connection')
    return this.client.quit()
  }
}
