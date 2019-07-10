import { CommonJob, CommonQueueName } from './types'
import logger from 'modules/logger'
import { Channel } from 'amqplib'
import * as _ from 'lodash'
import { User, TelegramAccount } from 'models'
import { telegramHook } from 'modules'
import { keyboardMainMenu } from 'chats/common'

export class CommonQueue {
  static instance?: CommonQueue = undefined

  constructor() {
    if (CommonQueue.instance) {
      return CommonQueue.instance
    } else {
      CommonQueue.instance = this
    }
  }

  async init(channel: Channel) {
    await channel.assertQueue(CommonQueueName.SEND_MESSAGE, { durable: true })

    await channel.prefetch(1)
    await this.initializeConsumers(channel)

    logger.info('OK: CommonQueue')
  }

  initializeConsumers(channel: Channel) {
    channel.consume(CommonQueueName.SEND_MESSAGE, async (msg) => {
      if (msg !== null) {
        try {
          const params: CommonJob[CommonQueueName.SEND_MESSAGE] = JSON.parse(
            msg.content.toString()
          )
          if (
            !params ||
            !params.title ||
            !params.userIdList ||
            !params.message
          ) {
            logger.error(
              '[Q] SEND_MESSAGE: Invalid params: ' + JSON.stringify(params)
            )
            channel.ack(msg)
            return
          }

          for await (const userId of params.userIdList) {
            try {
              const user = await User.findById(userId, {
                include: [{ model: TelegramAccount }]
              })

              if (!user) {
                logger.error(
                  '[Q] SEND_MESSAGE: error sending message to ' +
                    userId +
                    '. NOT_FOUND'
                )
              } else {
                // Send the message
                let title, message
                if (params.title.isTransKey == true) {
                  title = user.t(params.title.text)
                } else {
                  title = params.title.text
                }
                if (params.message.isTransKey == true) {
                  message = user.t(params.message.text)
                } else {
                  message = params.message.text
                }

                await telegramHook.getWebhook.sendMessage(
                  user.telegramUser.id,
                  `${title}\n\n${message}`,
                  {
                    parse_mode: 'Markdown',
                    reply_markup: keyboardMainMenu(user)
                  }
                )

                logger.info('Sent message to: ' + userId)
              }
            } catch (e) {
              logger.error(
                '[Q] SEND_MESSAGE Error sending message to user ' + userId
              )
            }
          }

          logger.info('[Q] SEND_MESSAGE - sent all messages')
          channel.ack(msg)
        } catch (e) {
          logger.error(
            '[Q] Error Sending message: ' +
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
