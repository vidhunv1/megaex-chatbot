import { amqp } from 'modules'
import { WalletQueueName, WalletJob } from './types'
import logger from 'modules/logger'
import { Channel } from 'amqplib'

export class WalletQueue {
  static instance?: WalletQueue = undefined

  constructor() {
    if (WalletQueue.instance) {
      return WalletQueue.instance
    } else {
      WalletQueue.instance = this
    }
  }

  async init(channel: Channel) {
    await channel.assertQueue(WalletQueueName.NEW_DEPOSIT, { durable: true })
    await channel.assertQueue(WalletQueueName.GEN_ADDRESS, { durable: true })

    await channel.assertQueue(WalletQueueName.TEST, { durable: true })

    await channel.prefetch(1)

    await this.initializeConsumers(channel)

    logger.info('OK: WalletQueue')
  }

  initializeConsumers(channel: Channel) {
    channel.consume(WalletQueueName.TEST, (msg) => {
      if (msg !== null) {
        console.log(
          '[Q<][DEBUG] Test received: ' + JSON.stringify(msg.content.toString())
        )

        channel.ack(msg)
        console.log('[x] DONE')
      }
    })

    channel.consume(WalletQueueName.NEW_DEPOSIT, (msg) => {
      logger.error(
        `TODO: handle ${WalletQueueName.NEW_DEPOSIT} Queue: ${
          msg ? msg.content.toString() : ''
        }`
      )
    })

    channel.consume(WalletQueueName.GEN_ADDRESS, (msg) => {
      logger.error(
        `TODO: handle ${WalletQueueName.NEW_DEPOSIT} Queue ${
          msg ? msg.content.toString() : ''
        }`
      )
    })
  }

  async genAddressToQ(opts: WalletJob[WalletQueueName.GEN_ADDRESS]) {
    const channel = amqp.channel
    await channel.sendToQueue(
      WalletQueueName.GEN_ADDRESS,
      Buffer.from(JSON.stringify(opts), 'utf8'),
      {
        persistent: true
      }
    )
    console.log('[Q>] Added getAddressToQ ' + JSON.stringify(opts))
  }

  async testToQ(msg: string) {
    const channel = amqp.channel
    await channel.sendToQueue(WalletQueueName.TEST, Buffer.from(msg, 'utf8'), {
      persistent: true
    })
    console.log('[Q>] Added testToQ ' + msg)
  }
}
