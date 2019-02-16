import Queue = require('bull')
import { WALLET_QUEUE_NAME } from '../constants'
import { WalletJobs, WalletJobProducer } from './types'
import { CONFIG } from '../../../config'
import logger from '../../logger'
import { CryptoCurrency } from '../../../constants/currencies'
import { Wallet } from '../../../models'

export type ProducerTypes =
  | WalletJobProducer[WalletJobs.CREATE_ADDRESS]
  | WalletJobProducer[WalletJobs.DEPOSIT_ALERT]
  | WalletJobProducer[WalletJobs.GET_TRANSACTION]
  | WalletJobProducer[WalletJobs.WITHDRAW_FUNDS]
  | WalletJobProducer[WalletJobs.GENERATED_ADDRESS]
  | WalletJobProducer[WalletJobs.WITHDRAWAL_STATUS_ALERT]

export class WalletQueue {
  static instance: WalletQueue
  private queue!: Queue.Queue<ProducerTypes>

  constructor() {
    if (WalletQueue.instance) {
      return WalletQueue.instance
    } else {
      WalletQueue.instance = this
    }

    if (!this.queue) {
      logger.warn('WalletQueue is not yet initialized.. call init()')
    }
  }

  async init(): Promise<boolean> {
    logger.info('Initializing wallet queue')

    this.queue = new Queue(WALLET_QUEUE_NAME, {
      redis: {
        port: parseInt(CONFIG.REDIS_PORT),
        host: CONFIG.REDIS_HOST,
        password: CONFIG.REDIS_PASSWORD
      }
    })

    try {
      await this.queue.isReady()
      this.initializeConsumers()

      logger.info('OK: Wallet Queue')
      return true
    } catch (e) {
      logger.error('Error: Wallet Queue')
      throw e
    }
  }

  get getQueue() {
    return this.queue
  }

  async close() {
    if (!this.queue) {
      logger.error('wallet queue is not initialized')
    } else {
      await this.queue.close()
    }
  }

  initializeConsumers() {
    this.queue.process(WalletJobs.GENERATED_ADDRESS, async (jobs) => {
      logger.error(
        `TODO: ${
          WalletJobs.GENERATED_ADDRESS
        } queue needs to check with Bitcoin RPC if the userId address is valid`
      )

      // TODO: save address to database
      const {
        address,
        userId,
        currency
      } = jobs.data as WalletJobProducer['generated-address']
      return Wallet.updateNewAddress(userId, currency, address)
    })

    this.queue.process(WalletJobs.DEPOSIT_ALERT, (_jobs) => {
      logger.error('TODO: wallet-queue Handle new deposits')
      // TODO: Handle new deposit

      // Check transaction hash and address for balance -> true => promise.resolve false => promise.reject

      return Promise.resolve()
    })

    this.queue.process(WalletJobs.WITHDRAWAL_STATUS_ALERT, (_jobs: any) => {
      // TODO: Handle withdrawal status
      return Promise.resolve()
    })
  }

  initializeListener() {
    this.queue.on('completed', (job, result) => {
      logger.info(
        `wallet-queue: JOB completed ${job.name}-${job.id} ${JSON.stringify(
          result
        )}`
      )
    })

    this.queue.on('error', (job) => {
      logger.error(`wallet-queue: JOB errored ${job.name}-${job.message}`)
    })

    this.queue.on('failed', (job) => {
      logger.error(`wallet-queue: JOB Failed ${job.name}-${job.id}`)
    })
  }

  // Producers
  generateNewAddress(currency: CryptoCurrency, userId: number) {
    logger.info(`Generating ${currency} address for ${userId}`)

    this.queue.add(WalletJobs.CREATE_ADDRESS, {
      userId,
      currency
    })
  }
}

export default new WalletQueue()
