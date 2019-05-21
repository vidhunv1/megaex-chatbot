import Queue = require('bull')
import { WALLET_QUEUE_NAME } from '../constants'
import { WalletJobs, WalletJobProducer } from './types'
import { CONFIG } from '../../../config'
// import { logger } from 'modules'
import { CryptoCurrency } from '../../../constants/currencies'

export type ProducerTypes =
  | WalletJobProducer[WalletJobs.GENERATE_NEW_ADDRESS]
  | WalletJobProducer[WalletJobs.DEPOSIT_ALERT]
  | WalletJobProducer[WalletJobs.WITHDRAW_FUNDS]

export class WalletQueue {
  static instance: WalletQueue
  private queue!: Queue.Queue<ProducerTypes>

  constructor() {
    if (WalletQueue.instance) {
      return WalletQueue.instance
    } else {
      WalletQueue.instance = this
      this.init()
    }

    if (!this.queue) {
      // logger.warn('WalletQueue is not yet initialized.. call init()')
    }
  }

  async init(): Promise<boolean> {
    // logger.info('Initializing wallet queue')

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

      // logger.info('OK: Wallet Queue')
      return true
    } catch (e) {
      // logger.error('Error: Wallet Queue')
      throw e
    }
  }

  get getQueue() {
    return this.queue
  }

  async close() {
    if (!this.queue) {
      // logger.error('wallet queue is not initialized')
    } else {
      await this.queue.close()
    }
  }

  initializeConsumers() {
    // this.queue.process(WalletJobs.DEPOSIT_ALERT, (_jobs: any) => {
    //   logger.error('TODO: wallet-queue Handle new deposits')
    //   // TODO: Handle new deposit
    //   // Check transaction hash and address for balance -> true => promise.resolve false => promise.reject
    //   return Promise.resolve()
    // })
  }

  initializeListener() {
    this.queue.on('completed', (_job, _result) => {
      // logger.info(
      //   `wallet-queue: JOB completed ${job.name}-${job.id} ${JSON.stringify(
      //     result
      //   )}`
      // )
    })

    this.queue.on('error', (_job) => {
      // logger.error(`wallet-queue: JOB errored ${job.name}-${job.message}`)
    })

    this.queue.on('failed', (_job) => {
      // logger.error(`wallet-queue: JOB Failed ${job.name}-${job.id}`)
    })
  }

  // Producers
  generateNewAddress(currency: CryptoCurrency, userId: number) {
    // Used only when RPC fails
    // logger.info(`Generating ${currency} address for ${userId}`)

    this.queue.add(WalletJobs.GENERATE_NEW_ADDRESS, {
      userId,
      currency
    })
  }
}

export default new WalletQueue()
