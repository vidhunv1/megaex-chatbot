import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement
} from 'sequelize-typescript'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { ExchangeSource, exchangeSourceInfo } from 'constants/exchangeSource'
import logger from 'modules/logger'

export type DataSource = ExchangeSource | 'Fiat'

@Table({ timestamps: true, tableName: 'Markets', paranoid: true })
export class Market extends Model<Market> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @Column
  fromCurrency!: CryptoCurrency | FiatCurrency

  @AllowNull(false)
  @Column
  toCurrency!: CryptoCurrency | FiatCurrency

  @AllowNull(false)
  @Column
  dataSource!: DataSource

  @AllowNull(false)
  @Column
  value!: number

  static async syncTickerData() {
    logger.info('Markets: Syncing ticker data')
    Object.values(ExchangeSource).forEach(async (exSource: ExchangeSource) => {
      if (exSource === ExchangeSource.LBC) {
        const apiResult = await exchangeSourceInfo[
          ExchangeSource.LBC
        ].getTickerApi()
        Object.values(FiatCurrency).forEach(async (fiat: FiatCurrency) => {
          const value = exchangeSourceInfo[exSource].apiGetter(
            apiResult,
            CryptoCurrency.BTC,
            fiat
          )
          if (value != null) {
            await Market.createOrUpdate(
              CryptoCurrency.BTC,
              fiat,
              value,
              ExchangeSource.LBC
            )
          } else {
            logger.error(
              `[Cron] No value available for ${
                CryptoCurrency.BTC
              } -> ${fiat} in ${ExchangeSource.LBC}`
            )
          }
        })
      } else {
        const apiResult = await exchangeSourceInfo[exSource].getTickerApi()
        const value = exchangeSourceInfo[exSource].apiGetter(
          apiResult,
          CryptoCurrency.BTC,
          FiatCurrency.USD
        )
        if (value != null) {
          await Market.createOrUpdate(
            CryptoCurrency.BTC,
            FiatCurrency.USD,
            value,
            exSource
          )
        } else {
          logger.error(
            `[Cron] No value available for ${CryptoCurrency.BTC} -> ${
              FiatCurrency.USD
            } in ${exSource}`
          )
        }
      }
    })
  }

  static async createOrUpdate(
    fromCurrency: FiatCurrency | CryptoCurrency,
    toCurrency: FiatCurrency | CryptoCurrency,
    value: number,
    dataSource: DataSource
  ) {
    const market = await Market.findOne({
      where: {
        fromCurrency,
        toCurrency,
        dataSource
      }
    })

    if (market) {
      await market.update({
        fromCurrency,
        toCurrency,
        value,
        dataSource
      })
    } else {
      await Market.create<Market>({
        fromCurrency,
        toCurrency,
        value,
        dataSource
      })
    }
  }

  // static async getValue(
  //   fromCurrency: string,
  //   toCurrency: string
  // ): Promise<number | null> {
  //   let market: Market | null,
  //     reverse = false
  //   if (Market.getCryptoCurrency(toCurrency) !== null) {
  //     market = await Market.findOne({
  //       where: { fromCurrency: toCurrency, toCurrency: fromCurrency }
  //     })
  //     reverse = true
  //   } else {
  //     market = await Market.findOne({ where: { fromCurrency, toCurrency } })
  //     reverse = false
  //   }
  //   if (!market) {
  //     return null
  //   }
  //   if (market.value) {
  //     return reverse ? 1 / market.value : market.value
  //   } else {
  //     const marketUsd: Market | null = await Market.findOne({
  //       where: {
  //         fromCurrency: reverse ? toCurrency : fromCurrency,
  //         toCurrency: 'usd'
  //       }
  //     })
  //     if (!marketUsd) return null
  //     const v = marketUsd.value * market.fromCurrencyUsdValue
  //     return reverse ? 1 / v : v
  //   }
  // }
}

export default Market
