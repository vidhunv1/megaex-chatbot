import * as Redis from 'redis'
import * as Bluebird from 'bluebird'
import logger from '../modules/logger'

import { CONFIG } from '../config'

export class Cache {
  static instance: Cache
  private client!: Redis.RedisClient
  private pub!: Redis.RedisClient
  private sub!: Redis.RedisClient

  constructor() {
    if (Cache.instance) {
      return Cache.instance
    } else {
      Cache.instance = this
    }

    if (!this.client || !this.pub || !this.sub) {
      logger.warn('WalletQueue is not yet initialized.. call init()')
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
    } catch (e) {
      logger.error('Error: Redis')
      throw e
    }
  }

  subscribeKeyExpiry(callback: (msg: string) => any) {
    if (!this.isInitialized()) {
      throw Error('Error subscribing to redis pub/sub. pub/sub not initialized')
    } else {
      logger.info('Initializing expiry subscriptions...')

      const sub = this.sub
      this.pub.sendCommand(
        'config',
        ['set', 'notify-keyspace-events', 'Ex'],
        async function() {
          const expired_subKey =
            '__keyevent@' + CONFIG.REDIS_DATABASE + '__:expired'
          await sub.subscribe(expired_subKey, () => {
            logger.info(
              'Activated expiry pub subsciptions: notify-kespace-events(Ex) - Keyevent-expiry'
            )

            sub!.on('message', async function(channel, message) {
              logger.info(
                'Received expiry message: ' + channel + ', ' + message
              )
              callback(message)
            })
          })
        }
      )
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
    }
  }

  async getCacheClient() {
    if (!this.client) {
      await this.init()
    } else {
      // any is used since we are using bluebird to promisify methods
      return this.client as any
    }
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
