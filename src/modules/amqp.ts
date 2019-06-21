import { logger } from 'modules'
import amqp = require('amqplib')

import { CONFIG } from '../config'
import { WalletQueue } from './queue/wallet/walletQueue'
import { TradeQueue } from './queue/trade/tradeQueue'

export class AMQP {
  static instance?: AMQP = undefined
  public connection!: amqp.Connection
  public channel!: amqp.Channel

  // Queues
  public walletQ!: WalletQueue
  public tradeQ!: TradeQueue

  constructor() {
    if (AMQP.instance) {
      return AMQP.instance
    } else {
      AMQP.instance = this
      this.init()
    }
  }

  async init() {
    logger.info('Initializing AMPQ' + CONFIG.NODE_ENV)

    this.connection = await amqp.connect(CONFIG.AMPQ_URL)
    this.channel = await this.connection.createChannel()

    this.walletQ = new WalletQueue()
    this.tradeQ = new TradeQueue()
    await this.walletQ.init(this.channel)
    await this.tradeQ.init(this.channel)
  }

  async close() {
    logger.info('Closing AMQP connection')
    if (this.connection) {
      this.connection.close()
    }
    if (this.channel) {
      this.channel.close()
    }
  }
}
