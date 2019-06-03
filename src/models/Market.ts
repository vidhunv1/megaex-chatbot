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
import axios from 'axios'
import * as _ from 'lodash'

export const FIAT_DATA_SOURCE = 'FIAT'
export type DataSource = ExchangeSource | typeof FIAT_DATA_SOURCE

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

  static async getFiatValue(
    cryptoCurrency: CryptoCurrency,
    fiatCurrency: FiatCurrency,
    exchangeSource: ExchangeSource
  ): Promise<number> {
    const m1 = await Market.findOne({
      where: {
        dataSource: exchangeSource,
        fromCurrency: cryptoCurrency,
        toCurrency: fiatCurrency
      }
    })

    if (m1) {
      // Direct conversion avalilable
      return m1.value
    } else {
      // TODO: Multiple queries can be merged to single call
      // Get usd value and convert
      const mUsd = await Market.findOne({
        where: {
          dataSource: exchangeSource,
          fromCurrency: cryptoCurrency,
          toCurrency: FiatCurrency.USD
        }
      })

      if (!mUsd) {
        logger.error(
          `Market/getFiatValue: No data available for ${cryptoCurrency} -> ${fiatCurrency} ${exchangeSource}`
        )
        throw new Error('No market data available')
      }

      const fiatRate = await Market.findOne({
        where: {
          dataSource: FIAT_DATA_SOURCE,
          fromCurrency: FiatCurrency.USD,
          toCurrency: fiatCurrency
        }
      })

      if (!fiatRate) {
        logger.error(
          'Market/getFiatValue fiat exchange rate not available for USD -> ' +
            fiatCurrency
        )
        throw new Error('No market data available')
      }

      return mUsd.value * fiatRate.value
    }
  }

  static async syncFiatExchangeRates() {
    logger.info('Markets: Syncing fiat exchange rates')

    const axiosInstance = axios.create({
      baseURL: 'http://data.fixer.io/api/',
      responseType: 'json',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    try {
      const result = (await axiosInstance.get(
        'latest?access_key=6c0a1d346d892a43fb0d4cd97a2ae779'
      )).data
      if (result.success == true) {
        const baseToUsd = _.get(result, `rates.${FiatCurrency.USD}`, null)
        if (!baseToUsd) {
          throw Error(
            'syncFiatExchangeRates Invalid base to usd: ' +
              JSON.stringify(result)
          )
        }

        Object.values(FiatCurrency).forEach(async (fiat) => {
          let val = _.get(result, `rates.${fiat}`, null)
          if (val != null) {
            // Convert base rates to USD
            val = val / baseToUsd
            await Market.createOrUpdate(FiatCurrency.USD, fiat, val, 'FIAT')
          } else {
            logger.error(
              `syncFiatExchangeRates fiat value for ${fiat} not available`
            )
          }
        })
      } else {
        logger.error('Error responde fiat sync: ' + JSON.stringify(result))
      }
    } catch (e) {
      logger.error('error with Fiat sync')
      throw e
    }
  }

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
}

export default Market
