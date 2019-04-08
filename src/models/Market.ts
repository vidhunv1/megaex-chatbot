import {
  Table,
  Column,
  Model,
  PrimaryKey,
  AllowNull,
  AutoIncrement,
  DataType
} from 'sequelize-typescript'

@Table({ timestamps: true, tableName: 'Markets' })
export class Market extends Model<Market> {
  @PrimaryKey
  @AllowNull(false)
  @AutoIncrement
  @Column
  id!: number

  @AllowNull(false)
  @Column
  fromCurrency!: string

  @AllowNull(false)
  @Column
  toCurrency!: string

  @AllowNull(false)
  @Column
  value!: number

  @AllowNull(false)
  @Column(DataType.STRING)
  toCurrencyType!: 'fiat' | 'crypto'

  @AllowNull(true)
  @Column(DataType.FLOAT)
  fromCurrencyUsdValue!: number

  static getFiatCurrency(
    currencyCode: string
  ): { name: string; code: string; symbol?: string } | null {
    const c = this.getFiatCurrencies()
    for (let i = 0; i < c.length; i++) {
      if (c[i].code === currencyCode) return c[i]
    }
    return null
  }

  static getCryptoCurrency(
    currencyCode: string
  ): { name: string; code: string; symbol?: string } | null {
    const c = this.getCryptoCurrencies()
    for (let i = 0; i < c.length; i++) {
      if (c[i].code === currencyCode) return c[i]
    }
    return null
  }

  static getCryptoCurrencyIndex(currencyCode: string): number {
    const c = this.getCryptoCurrencies()
    for (let i = 0; i < c.length; i++) {
      if (c[i].code === currencyCode) return i
    }
    return -1
  }

  static async parseCurrencyValue(
    text: string,
    toCurrency: string
  ): Promise<number | null> {
    text = text.toLowerCase().replace(/[^0-9a-z.]/g, '')
    const amount = parseFloat(text.replace(/[^0-9.]/g, ''))
    let currencyCode = text.replace(/[^a-z]/g, '').toLowerCase()
    currencyCode = currencyCode === '' ? 'btc' : currencyCode
    if (
      (this.getFiatCurrency(currencyCode) ||
        this.getCryptoCurrency(currencyCode)) &&
      amount > 0
    ) {
      if (currencyCode === toCurrency) {
        return amount
      } else {
        const v = await this.getValue(currencyCode, toCurrency)
        if (v) {
          return v * amount
        }
        return null
      }
    } else {
      return null
    }
  }

  static async getValue(
    fromCurrency: string,
    toCurrency: string
  ): Promise<number | null> {
    let market: Market | null,
      reverse = false
    if (Market.getCryptoCurrency(toCurrency) !== null) {
      market = await Market.findOne({
        where: { fromCurrency: toCurrency, toCurrency: fromCurrency }
      })
      reverse = true
    } else {
      market = await Market.findOne({ where: { fromCurrency, toCurrency } })
      reverse = false
    }
    if (!market) {
      return null
    }
    if (market.value) {
      return reverse ? 1 / market.value : market.value
    } else {
      const marketUsd: Market | null = await Market.findOne({
        where: {
          fromCurrency: reverse ? toCurrency : fromCurrency,
          toCurrency: 'usd'
        }
      })
      if (!marketUsd) return null
      const v = marketUsd.value * market.fromCurrencyUsdValue
      return reverse ? 1 / v : v
    }
  }

  static getCryptoCurrencies() {
    return [
      { name: 'Bitcoin', code: 'btc' },
      { name: 'Test Bitcoin', code: 'tbtc' }
    ]
  }

  static getFiatCurrencies() {
    return [
      { name: '$ USD', code: 'usd', symbol: '$' },
      { name: '₹ INR', code: 'inr', symbol: '₹' },
      { name: '¥ CNY', code: 'cny', symbol: '¥' }, // chinese yuan
      { name: '₽ RUB', code: 'rub', symbol: '₽' },
      { name: '€ EUR', code: 'eur', symbol: '€' },
      { name: '£ GBP', code: 'gbp', symbol: '£' },
      { name: '¥ JPY', code: 'jpy', symbol: '¥' },
      { name: 'CAD', code: 'cad' },
      { name: 'CHF', code: 'chf' },
      { name: 'AUD', code: 'aud' },
      { name: 'SGD', code: 'sgd' },
      { name: 'MYR', code: 'myr' },
      { name: 'NZD', code: 'nzd' },
      { name: 'THB', code: 'thb' },
      { name: 'HUF', code: 'huf' },
      { name: 'AED', code: 'aed' },
      { name: 'HKD', code: 'hkd' },
      { name: 'MXN', code: 'mxn' },
      { name: 'ZAR', code: 'zar' },
      { name: 'PHP', code: 'php' },
      { name: 'SEK', code: 'sek' },
      { name: 'IDR', code: 'idr' },
      { name: 'SAR', code: 'sar' },
      { name: 'BRL', code: 'brl' },
      { name: 'TRY', code: 'try' },
      { name: 'KES', code: 'kes' },
      { name: 'KRW', code: 'krw' },
      { name: 'EGP', code: 'egp' },
      { name: 'IQD', code: 'iqd' },
      { name: 'NOK', code: 'nok' },
      { name: 'KWD', code: 'kwd' },
      { name: 'DKK', code: 'dkk' },
      { name: 'PKR', code: 'pkr' },
      { name: 'ILS', code: 'ils' },
      { name: 'PLN', code: 'pln' },
      { name: 'QAR', code: 'qar' },
      { name: 'XAU', code: 'xau' },
      { name: 'OMR', code: 'omr' },
      { name: 'COP', code: 'cop' },
      { name: 'CLP', code: 'clp' },
      { name: 'TWD', code: 'twd' },
      { name: 'ARS', code: 'ars' },
      { name: 'CZK', code: 'czk' },
      { name: 'VND', code: 'vnd' },
      { name: 'MAD', code: 'mad' },
      { name: 'JOD', code: 'jod' },
      { name: 'BHD', code: 'bhd' },
      { name: 'XOF', code: 'xof' },
      { name: 'LKR', code: 'lkr' },
      { name: 'UAH', code: 'uah' },
      { name: 'NGN', code: 'ngn' },
      { name: 'TND', code: 'tnd' },
      { name: 'UGX', code: 'ugx' },
      { name: 'RON', code: 'ron' },
      { name: 'BDT', code: 'bdt' },
      { name: 'PEN', code: 'pen' },
      { name: 'GEL', code: 'gel' },
      { name: 'XAF', code: 'xaf' },
      { name: 'FJD', code: 'fjd' },
      { name: 'VEF', code: 'vef' },
      { name: 'BYN', code: 'byn' },
      { name: 'HRK', code: 'hrk' },
      { name: 'UZS', code: 'uzs' },
      { name: 'BGN', code: 'bgn' },
      { name: 'DZD', code: 'dzd' },
      { name: 'IRR', code: 'irr' },
      { name: 'DOP', code: 'dop' },
      { name: 'ISK', code: 'isk' },
      { name: 'XAG', code: 'xag' },
      { name: 'CRC', code: 'crc' },
      { name: 'SYP', code: 'syp' },
      { name: 'LYD', code: 'lyd' },
      { name: 'JMD', code: 'jmd' },
      { name: 'MUR', code: 'mur' },
      { name: 'GHS', code: 'ghs' },
      { name: 'AOA', code: 'aoa' },
      { name: 'UYU', code: 'uyu' },
      { name: 'AFN', code: 'afn' },
      { name: 'LBP', code: 'lbp' },
      { name: 'XPF', code: 'xpf' },
      { name: 'TTD', code: 'ttd' },
      { name: 'TZS', code: 'tzs' },
      { name: 'ALL', code: 'all' },
      { name: 'XCD', code: 'xcd' },
      { name: 'GTQ', code: 'gtq' },
      { name: 'NPR', code: 'npr' },
      { name: 'BOB', code: 'bob' },
      { name: 'ZWD', code: 'zwd' },
      { name: 'BBD', code: 'bbd' },
      { name: 'CUC', code: 'cuc' },
      { name: 'LAK', code: 'lak' },
      { name: 'BND', code: 'bnd' },
      { name: 'BWP', code: 'bwp' },
      { name: 'HNL', code: 'hnl' },
      { name: 'PYG', code: 'pyg' },
      { name: 'ETB', code: 'etb' },
      { name: 'NAD', code: 'nad' },
      { name: 'PGK', code: 'pgk' },
      { name: 'SDG', code: 'sdg' },
      { name: 'MOP', code: 'mop' },
      { name: 'NIO', code: 'nio' },
      { name: 'BMD', code: 'bmd' },
      { name: 'KZT', code: 'kzt' },
      { name: 'PAB', code: 'pab' },
      { name: 'BAM', code: 'bam' },
      { name: 'GYD', code: 'gyd' },
      { name: 'YER', code: 'yer' },
      { name: 'MGA', code: 'mga' },
      { name: 'KYD', code: 'kyd' },
      { name: 'MZN', code: 'mzn' },
      { name: 'RSD', code: 'rsd' },
      { name: 'SCR', code: 'scr' },
      { name: 'AMD', code: 'amd' },
      { name: 'SBD', code: 'sbd' },
      { name: 'AZN', code: 'azn' },
      { name: 'SLL', code: 'sll' },
      { name: 'TOP', code: 'top' },
      { name: 'BZD', code: 'bzd' },
      { name: 'MWK', code: 'mwk' },
      { name: 'GMD', code: 'gmd' },
      { name: 'BIF', code: 'bif' },
      { name: 'SOS', code: 'sos' },
      { name: 'HTG', code: 'htg' },
      { name: 'GNF', code: 'gnf' },
      { name: 'MVR', code: 'mvr' },
      { name: 'MNT', code: 'mnt' },
      { name: 'CDF', code: 'cdf' },
      { name: 'STD', code: 'std' },
      { name: 'TJS', code: 'tjs' },
      { name: 'KPW', code: 'kpw' },
      { name: 'MMK', code: 'mmk' },
      { name: 'LSL', code: 'lsl' },
      { name: 'LRD', code: 'lrd' },
      { name: 'KGS', code: 'kgs' },
      { name: 'GIP', code: 'gip' },
      { name: 'XPT', code: 'xpt' },
      { name: 'MDL', code: 'mdl' },
      { name: 'CUP', code: 'cup' },
      { name: 'KHR', code: 'khr' },
      { name: 'MKD', code: 'mkd' },
      { name: 'VUV', code: 'vuv' },
      { name: 'MRO', code: 'mro' },
      { name: 'ANG', code: 'ang' },
      { name: 'SZL', code: 'szl' },
      { name: 'CVE', code: 'cve' },
      { name: 'SRD', code: 'srd' },
      { name: 'XPD', code: 'xpd' },
      { name: 'SVC', code: 'svc' },
      { name: 'BSD', code: 'bsd' },
      { name: 'XDR', code: 'xdr' },
      { name: 'RWF', code: 'rwf' },
      { name: 'AWG', code: 'awg' },
      { name: 'DJF', code: 'djf' },
      { name: 'BTN', code: 'btn' },
      { name: 'KMF', code: 'kmf' },
      { name: 'WST', code: 'wst' },
      { name: 'SPL', code: 'spl' },
      { name: 'ERN', code: 'ern' },
      { name: 'FKP', code: 'fkp' },
      { name: 'SHP', code: 'shp' },
      { name: 'JEP', code: 'jep' },
      { name: 'TMT', code: 'tmt' },
      { name: 'TVD', code: 'tvd' },
      { name: 'IMP', code: 'imp' },
      { name: 'GGP', code: 'ggp' },
      { name: 'ZMW', code: 'zmw' }
    ]
  }
}

export default Market
