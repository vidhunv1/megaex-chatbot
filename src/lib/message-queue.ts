import * as Kue from 'kue'
import * as JWT from 'jsonwebtoken'

import NotificationManager from './notification-manager'
import { CONFIG } from '../config'
import logger from '../modules/logger'

export default class MessageQueue {
  static instance: MessageQueue
  queue!: Kue.Queue
  notificationManager!: NotificationManager

  constructor() {
    if (MessageQueue.instance) return MessageQueue.instance

    this.queue = Kue.createQueue({
      prefix: 'q',
      db: CONFIG.REDIS_DATABASE,
      redis: {
        host: CONFIG.REDIS_HOST,
        port: CONFIG.REDIS_PORT,
        auth: CONFIG.REDIS_PASSWORD
      }
    })
    this.createNotificationHandler()
    this.notificationManager = new NotificationManager()
    MessageQueue.instance = this
  }

  generateBtcAddress(id: number): Promise<string> {
    logger.info('generate btc address')
    const q = this.queue
    const jwtSecret = CONFIG.JWT_SECRET
    const promise = new Promise(function(
      resolve: (address: string) => any,
      reject
    ) {
      const job = q
        .create('btc.generateAddress', { id: id })
        .attempts(999999)
        .save(function(err: any) {
          if (err) {
            reject(new Error('Error creating job'))
          }
        })
      job
        .on('complete', function(addressSignature) {
          try {
            const decoded = JSON.stringify(
              JWT.verify(addressSignature, jwtSecret)
            )
            resolve(decoded)
          } catch (err) {
            if (err.name === 'JsonWebTokenError')
              logger.error(
                'generateBtcAddress could not verify token, invalid signature probably'
              )
            reject(new Error('Could not verify signature'))
          }
        })
        .on('failed attempt', function(_errorMessage, _doneAttempts) {})
        .on('failed', function(errorMessage) {
          reject(new Error(errorMessage))
        })
        .on('progress', function(_progress, _data) {})
    })
    return promise
  }

  createNotificationHandler() {
    logger.info('MessageQueue initializing main notification handler')
    const _this = this
    this.queue.process('notification', 4, async function(job, done) {
      const notificationType = job.data.notificationType
      _this.notificationManager.sendNotification(notificationType, job.data)
      done(null)
    })
  }

  async close() {
    const q = this.queue
    return new Promise(function(resolve, _reject) {
      q.shutdown(0, function(err: any) {
        logger.info('Kue is shut down.', err || '')
        resolve()
      })
    })
  }
}
