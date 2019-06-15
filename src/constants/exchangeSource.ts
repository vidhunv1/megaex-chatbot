import { FiatCurrency, CryptoCurrency } from './currencies'
import axios from 'axios'
import logger from 'modules/logger'
import * as _ from 'lodash'

export enum ExchangeSource {
  BINANCE = 'BINANCE',
  LBC = 'LBC',
  COINBASE = 'COINBASE',
  KRAKEN = 'KRAKEN'
}

export const exchangeSourceInfo: Record<
  ExchangeSource,
  {
    getTickerApi: () => Promise<any>
    apiGetter: (
      apiResult: any,
      fromCurrency: FiatCurrency | CryptoCurrency,
      toCurrency: FiatCurrency | CryptoCurrency
    ) => number | null
  }
> = {
  [ExchangeSource.BINANCE]: {
    async getTickerApi() {
      const axiosInstance = axios.create({
        baseURL: `https://api.binance.com/api/v1/`,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      try {
        return (await axiosInstance.get('ticker/price?symbol=BTCUSDT')).data
      } catch (e) {
        logger.error('Ticker error with ' + ExchangeSource.BINANCE)
        throw e
      }
    },
    apiGetter(apiResult, fromCurrency, toCurrency) {
      if (
        fromCurrency != CryptoCurrency.BTC ||
        toCurrency != FiatCurrency.USD
      ) {
        return null
      }
      const price = _.get(apiResult, 'price', null)
      if (price != null) {
        return parseFloat(price)
      }
      return null
    }
  },
  [ExchangeSource.LBC]: {
    async getTickerApi() {
      const axiosInstance = axios.create({
        baseURL: `https://localbitcoins.com/`,
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      try {
        return (await axiosInstance.get(
          'bitcoinaverage/ticker-all-currencies/'
        )).data
      } catch (e) {
        logger.error('Ticker error with ' + ExchangeSource.LBC)
        throw e
      }
    },
    apiGetter(apiResult, fromCurrency, toCurrency) {
      if (fromCurrency != CryptoCurrency.BTC) {
        return null
      }
      const cur = apiResult[toCurrency]
      const price = _.get(cur, 'avg_6h', null)
      if (price != null) {
        return parseFloat(price)
      }
      return null
    }
  },
  [ExchangeSource.COINBASE]: {
    async getTickerApi() {
      const axiosInstance = axios.create({
        baseURL: ' https://api.coinbase.com/v2/',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      try {
        return (await axiosInstance.get('prices/spot?currency=USD')).data
      } catch (e) {
        logger.error('Ticker error with ' + ExchangeSource.COINBASE)
        throw e
      }
    },
    apiGetter(apiResult, fromCurrency, toCurrency) {
      if (
        fromCurrency != CryptoCurrency.BTC &&
        toCurrency != FiatCurrency.USD
      ) {
        return null
      }

      const price = _.get(apiResult, 'data.amount', null)
      if (price != null) {
        return parseFloat(price)
      }
      return null
    }
  },
  [ExchangeSource.KRAKEN]: {
    async getTickerApi() {
      const axiosInstance = axios.create({
        baseURL: 'https://api.kraken.com/0/',
        responseType: 'json',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      try {
        return (await axiosInstance.get('public/Ticker?pair=xbtusd')).data
      } catch (e) {
        logger.error('Ticker error with ' + ExchangeSource.COINBASE)
        throw e
      }
    },
    apiGetter(apiResult, fromCurrency, toCurrency) {
      if (
        fromCurrency != CryptoCurrency.BTC &&
        toCurrency != FiatCurrency.USD
      ) {
        return null
      }

      const price = _.get(apiResult, 'result.XXBTZUSD.c[0]', null)
      if (price != null) {
        return parseFloat(price)
      }
      return null
    }
  }
}
