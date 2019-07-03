import { CronJob } from 'cron'
import { logger } from 'modules'
import { Market, TelegramGroup } from 'models'
import { sendRate } from 'chats/groupHandler'
import * as moment from 'moment'

export default class Jobs {
  jobs: CronJob[]
  constructor() {
    this.jobs = []
    // this.jobs.push(this.getSyncTransactionsJob())
    this.jobs.push(this.getSyncTickersJob())
    this.jobs.push(this.getSyncFiatRatesJob())
    this.jobs.push(this.getGroupAlertJob())
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

  // private getSyncTransactionsJob() {
  //   return new CronJob({
  //     cronTime: '*/10 * * * *',
  //     onTick: async function() {
  //       await btcRpc.syncTransactions()
  //     },
  //     onComplete: function() {},
  //     start: false
  //   })
  // }

  private getSyncTickersJob() {
    return new CronJob({
      cronTime: '*/10 * * * *',
      onTick: async function() {
        await Market.syncTickerData()
      },
      onComplete: function() {},
      start: false
    })
  }

  private getSyncFiatRatesJob() {
    return new CronJob({
      cronTime: '0 */12 * * *',
      onTick: async function() {
        await Market.syncFiatExchangeRates()
      },
      onComplete: function() {},
      start: false
    })
  }

  private getGroupAlertJob() {
    return new CronJob({
      cronTime: '0 */1 * * *',
      onTick: async function() {
        const groups = await TelegramGroup.findAll()
        groups.forEach((g) => {
          try {
            const now = moment()
            if (!g.deletedAt && now.hours() % g.dailyAlertLimit === 0) {
              sendRate(g)
            }
          } catch (e) {
            logger.error('Erro sending notify to group: ' + g.telegramGroupId)
          }
        })
      },
      onComplete: function() {},
      start: false
    })
  }
}
