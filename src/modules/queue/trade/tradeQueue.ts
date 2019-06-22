import { TradeQueueName, TradeJob } from './types'
import logger from 'modules/logger'
import { Channel } from 'amqplib'
import * as _ from 'lodash'
import { Trade } from 'models'

export class TradeQueue {
  static instance?: TradeQueue = undefined

  constructor() {
    if (TradeQueue.instance) {
      return TradeQueue.instance
    } else {
      TradeQueue.instance = this
    }
  }

  async init(channel: Channel) {
    await channel.assertQueue(TradeQueueName.RESOLVE_DISPUTE, { durable: true })

    await channel.prefetch(1)
    await this.initializeConsumers(channel)

    logger.info('OK: TradeQueue')
  }

  initializeConsumers(channel: Channel) {
    channel.consume(TradeQueueName.RESOLVE_DISPUTE, async (msg) => {
      if (msg !== null) {
        try {
          const params: TradeJob[TradeQueueName.RESOLVE_DISPUTE] = JSON.parse(
            msg.content.toString()
          )
          if (!params || !params.disputeId || !params.winnerUserId) {
            logger.error(
              '[Q] RESOLVE_DISPUTE: Invalid params: ' + JSON.stringify(params)
            )
            channel.ack(msg)
            return
          }

          const trade = await Trade.resolveDispute(
            params.disputeId,
            params.winnerUserId
          )
          if (trade) {
            logger.info(
              '[Q] Dispute resolved: releasedTo' + params.winnerUserId
            )
            channel.ack(msg)
          } else {
            channel.ack(msg)
            logger.error(
              '[Q] Error resolving dispute for dispute' + params.disputeId
            )
          }
        } catch (e) {
          logger.error(
            '[Q] Error resolving trade duspute: ' +
              JSON.stringify(msg.content.toString())
          )
          channel.ack(msg)
          throw e
        }
      } else {
        logger.error('[Q] New deposit params null' + JSON.stringify(msg))
      }
    })
  }
}
