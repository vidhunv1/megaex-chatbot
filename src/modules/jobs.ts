import { CronJob } from 'cron'
import logger from '../modules/Logger'
import btcRpc from 'core/crypto/btcRpc'
import { Market } from 'models'

export default class Jobs {
  jobs: CronJob[]
  constructor() {
    this.jobs = []
    this.jobs.push(this.getSyncTransactionsJob())
    this.jobs.push(this.getSyncTickersJob())
  }

  start() {
    logger.info('Starting all jobs: ')
    for (let i = 0; i < this.jobs.length; i++) {
      this.jobs[i].start()
    }
  }

  stop() {
    logger.info('stopping all jobs')
    for (let i = 0; i < this.jobs.length; i++) {
      this.jobs[i].stop()
    }
  }

  private getSyncTransactionsJob() {
    return new CronJob({
      cronTime: '*/10 * * * *',
      onTick: async function() {
        await btcRpc.syncTransactions()
      },
      onComplete: function() {},
      start: false
    })
  }

  private getSyncTickersJob() {
    return new CronJob({
      cronTime: '*/30 * * * *',
      onTick: async function() {
        await Market.syncTickerData()
      },
      onComplete: function() {},
      start: false
    })
  }
}
