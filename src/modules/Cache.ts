import * as Redis from 'redis'
import * as Bluebird from 'bluebird'
import logger from 'modules/Logger'
import { initializeQueues, closeQueues } from 'modules/queue'
import { expirySubscription } from 'chats/subscriptions'

import { CONFIG } from '../config'

export interface RedisAPI {
  getAsync: (key: string) => Promise<string | null>
  setAsync: (
    key: string,
    value: string | number,
    option1?: 'EX',
    value1?: number
  ) => Promise<'OK' | string>
  delAsync: (key: string) => Promise<'OK' | string>
}

export class Cache {
  static instance?: Cache = undefined
  private client!: Redis.RedisClient
  private pub!: Redis.RedisClient
  private sub!: Redis.RedisClient
  private isExpirySubscriptionInitialized: boolean = false

  constructor() {
    if (Cache.instance) {
      return Cache.instance
    } else {
      Cache.instance = this

      this.init()
    }

    if (!this.client || !this.pub || !this.sub) {
      logger.warn('WalletQueue is not yet initialized..')
    }
  }

  async init() {
    logger.info(
      'Initializing redis & pub sub using database: ' + CONFIG.NODE_ENV
    )

    Bluebird.promisifyAll(Redis.RedisClient.prototype)
    Bluebird.promisifyAll(Redis.Multi.prototype)

    const options = {
      host: CONFIG.REDIS_HOST,
      port: CONFIG.REDIS_PORT ? parseInt(CONFIG.REDIS_PORT) : undefined,
      password: CONFIG.REDIS_PASSWORD
    }

    try {
      this.client = await Redis.createClient(options)
      this.pub = await Redis.createClient(options)
      this.sub = await Redis.createClient(options)

      await this.client.select(CONFIG.REDIS_DATABASE)
      await this.pub.select(CONFIG.REDIS_DATABASE)
      await this.sub.select(CONFIG.REDIS_DATABASE)
      Cache.instance = this
      logger.info('OK: Redis')

      logger.info('Initializing redis queues')
      await initializeQueues()

      this.subscribeKeyExpiry((msg: string) =>
        expirySubscription(msg, this.getClient)
      )
    } catch (e) {
      logger.error('Error: Redis')
      throw e
    }
  }

  subscribeKeyExpiry(callback: (msg: string) => any) {
    if (!this.isInitialized()) {
      throw Error('Error subscribing to redis pub/sub. pub/sub not initialized')
    } else {
      const sub = this.sub
      if (!this.isExpirySubscriptionInitialized) {
        logger.info('Initializing expiry subscriptions...')
        this.pub.sendCommand(
          'config',
          ['set', 'notify-keyspace-events', 'Ex'],
          async () => {
            const expired_subKey =
              '__keyevent@' + CONFIG.REDIS_DATABASE + '__:expired'
            await sub.subscribe(expired_subKey, () => {
              logger.info(
                'Activated expiry pub subsciptions: notify-kespace-events(Ex) - Keyevent-expiry'
              )

              sub!.on('message', async (_channel, message) => {
                callback(message)
              })
            })
          }
        )
        this.isExpirySubscriptionInitialized = true
      }
    }
  }

  unsubscribeKeyExpiry() {
    logger.info('Unsubscribe expiry key')

    if (this.pub) {
      this.pub!.sendCommand(
        'config',
        ['set', 'notify-keyspace-events', ''],
        () => {}
      )
    }
  }

  async close() {
    logger.info('Closing redis connection')

    if (this.isInitialized()) {
      await this.unsubscribeKeyExpiry()

      await this.client!.quit()
      await this.sub!.quit()
      await this.pub!.quit()

      await closeQueues()
    }
  }

  get getClient() {
    if (!this.client) {
      logger.error('FATAL! Cache Client is not defined')
      throw new Error('cache.ts getClient() client not defined')
    }
    return (this.client as any) as RedisAPI
  }

  getCachePub() {
    return this.pub
  }

  getCacheSub() {
    return this.sub
  }

  isInitialized() {
    if (!this.pub || !this.client || !this.sub) {
      logger.error('Redis not initialized')
      return false
    }
    return true
  }
}

export default new Cache()
