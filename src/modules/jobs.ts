import { CronJob } from 'cron'
import logger from '../modules/Logger'
import btcRpc from 'core/crypto/btcRpc'

export default class Jobs {
  jobs: CronJob[]
  constructor() {
    this.jobs = []
    this.jobs.push(this.getSyncTransactionsJob())
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

  //   private getDeleteExpiredPaymentsJob() {
  //     return new CronJob({
  //       cronTime: '*/2 * * * *',
  //       onTick: async function() {
  //         console.log('Deleting expired payments')
  //         await Transfer.deleteExpiredPayments()
  //       },
  //       onComplete: function() {},
  //       start: false
  //     })
  //   }

  private getSyncTransactionsJob() {
    return new CronJob({
      cronTime: '*/5 * * * *',
      onTick: async function() {
        await btcRpc.syncTransactions()
      },
      onComplete: function() {},
      start: false
    })
  }
}
