import { CronJob } from 'cron'
import * as request from 'request-promise'
import { Market } from './models/market'
import * as moment from 'moment'
import logger from './modules/logger'
import { Transfer } from './models/transfer'
export default class Jobs {
  jobs: CronJob[]
  constructor() {
    this.jobs = []
    this.jobs.push(this.getMarketRatesJob())
    this.jobs.push(this.getDeleteExpiredPaymentsJob())
  }

  start() {
    console.log('Starting all jobs: ')
    for (let i = 0; i < this.jobs.length; i++) {
      this.jobs[i].start()
    }
  }

  stop() {
    console.log('stopping all jobs')
    for (let i = 0; i < this.jobs.length; i++) {
      this.jobs[i].stop()
    }
  }

  private getMarketRatesJob() {
    return new CronJob({
      cronTime: '*/2 * * * *',
      onTick: async function() {
        console.log('[TODO] Fetch and update market rates')

        const pd: Market[] = (await Market.sequelize.query(
          'SELECT * FROM "Markets" WHERE "fromCurrency"=\'btc\' AND "toCurrency" IN (SELECT DISTINCT "currencyCode" FROM "Users") ORDER BY "updatedAt" DESC'
        ))[0]
        let shouldSync = false,
          exchangeRates
        for (let i = 0; i < pd.length; i++) {
          if (pd[i].toCurrency === 'inr') {
            try {
              const zebpayResp = JSON.parse(
                await request(
                  'https://www.zebapi.com/api/v1/market/ticker-new/btc/inr'
                )
              )
              console.log(
                'UPDATING ZEBPAY PRICE: ' +
                  zebpayResp['24hoursHigh'] +
                  ', ' +
                  JSON.stringify(pd[i])
              )
              await Market.update(
                { value: zebpayResp['24hoursHigh'] },
                { where: { id: pd[i].id } }
              )
            } catch (e) {
              logger.error('getMarketRatesJob ERROR UPDATING: ' + e)
            }
          } else if (pd[i].toCurrency === 'usd') {
            try {
              const btcPrice = JSON.parse(
                await request(
                  'https://api.coinmarketcap.com/v1/ticker/bitcoin/?convert=usd'
                )
              )[0].price_usd
              await Market.update(
                { value: btcPrice },
                { where: { id: pd[i].id } }
              )
            } catch (e) {}
          } else if (!shouldSync) {
            if (moment().diff(pd[i].updatedAt, 'hour') >= 24) {
              try {
                exchangeRates = JSON.parse(
                  await request(
                    'http://data.fixer.io/api/latest?access_key=b7cb98de1d0f513b39019d797f7514ff&base=eur'
                  )
                )
                shouldSync = true
              } catch (e) {
                logger.error(
                  'getMarketRatesJobERROR UPDATING' + JSON.stringify(e)
                )
              }
            }
          }

          if (shouldSync) {
            const usdRate = exchangeRates.rates['USD']
            if (
              usdRate &&
              exchangeRates.rates[pd[i].toCurrency.toUpperCase()]
            ) {
              try {
                await Market.update(
                  {
                    toCurrencyUsdValue:
                      exchangeRates.rates[pd[i].toCurrency.toUpperCase()] /
                      usdRate
                  },
                  { where: { id: pd[i].id } }
                )
              } catch (e) {
                logger.error(
                  'getMarketRatesJob ERROR UPDATING' + JSON.stringify(e)
                )
              }
            }
          }
        }
      },
      onComplete: function() {},
      start: false
    })
  }

  private getDeleteExpiredPaymentsJob() {
    return new CronJob({
      cronTime: '*/2 * * * *',
      onTick: async function() {
        console.log('Deleting expired payments')
        await Transfer.deleteExpiredPayments()
      },
      onComplete: function() {},
      start: false
    })
  }
}
