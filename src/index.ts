if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

require('module-alias/register')
import { db } from 'modules'
import { cacheConnection, amqp } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import { telegramHook } from 'modules'
import { Account } from 'lib/Account'
import { Router } from 'chats/router'
import { logger } from 'modules'

import Jobs from 'modules/jobs'
import { UserInfo } from './models'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'
import { handleGroupMessage, handleChannel } from 'chats/groupHandler'
;(async () => {
  telegramHook.getWebhook.on('channel_post', async function(
    msg: TelegramBot.Message
  ) {
    handleChannel(msg)
  })
  telegramHook.getWebhook.on('message', async function onMessage(
    msg: TelegramBot.Message
  ) {
    try {
      if (
        msg.from &&
        msg.chat &&
        msg.chat.id === msg.from.id &&
        !msg.from.is_bot
      ) {
        const account = new Account(msg.from.id, msg.from)

        try {
          const telegramAccount = await account.createOrGetAccount()
          // @ts-ignore
          if (msg.passport_data) {
            const uinfo = await UserInfo.findOne({
              where: {
                userId: telegramAccount.userId
              }
            })
            if (!uinfo) {
              UserInfo.create<UserInfo>({
                passportData: JSON.stringify(msg),
                userId: telegramAccount.userId
              })
            } else {
              uinfo.update({
                passportData: JSON.stringify(msg)
              })
            }

            telegramHook.getWebhook.sendMessage(
              msg.chat.id,
              telegramAccount.user.t(
                `${Namespace.Account}:home.passport-data-received`
              ),
              {
                parse_mode: 'Markdown',
                reply_markup: keyboardMainMenu(telegramAccount.user)
              }
            )
          } else {
            Router.routeMessage(msg, telegramAccount.user, telegramAccount)
          }
        } catch (e) {
          logger.error('index.ts#44 Unable to create account')
          telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            'Error screating account'
          )
          throw e
        }
      } else if (
        (msg.chat.type === 'group' ||
          msg.chat.type === 'channel' ||
          msg.chat.type === 'supergroup') &&
        msg.from
      ) {
        handleGroupMessage(msg)
      } else {
        logger.error('Unhandled telegram message action')
      }
    } catch (e) {
      logger.error('FATAL: An unknown error occurred: ')
      telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        'An error occured. Please try again later.'
      )
      throw e
    }
  })

  telegramHook.getWebhook.on('callback_query', async function(callback) {
    const msg: TelegramBot.Message = callback.message

    const telegramAccount = await new Account(
      msg.chat.id,
      undefined
    ).createOrGetAccount()
    Router.routeCallback(
      callback.message,
      telegramAccount.user,
      telegramAccount,
      callback
    )
  })

  // Start all jobs
  const jobs = new Jobs()
  jobs.start()

  process.on('SIGINT', async function() {
    logger.info('Ending process...')
    logger.info('closing sql')

    await db.close()
    await cacheConnection.close()
    await amqp.close()
    await jobs.stop()
    process.exit(0)
  })
})()
