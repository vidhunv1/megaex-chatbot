if (!process.env.NODE_ENV) {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

import * as TelegramBot from 'node-telegram-bot-api'
import logger from './modules/Logger'
import tHook from './modules/TelegramHook'
import { initializeQueues, closeQueues } from './modules/queue'
import { DB } from './modules/db'
import { Cache } from './modules/cache'
import { Account } from './lib/accounts'
import { Router } from './chats/router'
import { expirySubscription } from './chats/subscriptions'
;(async () => {
  /* 
    Initializations
  */
  // Redis Init
  const cacheConnection = new Cache()
  await cacheConnection.init()

  // Queue Init
  await initializeQueues()
  // Telegram hook
  // Postgres Init
  await new DB().init()
  cacheConnection.subscribeKeyExpiry((msg: string) =>
    expirySubscription(msg, cacheConnection.getClient)
  )

  tHook.getWebhook.on('message', async function onMessage(
    msg: TelegramBot.Message
  ) {
    try {
      if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
        const account = new Account(msg.from.id, msg.from)

        try {
          const telegramAccount = await account.createOrGetAccount()
          Router.routeMessage(msg, telegramAccount.user, telegramAccount)
        } catch (e) {
          logger.error('index.ts#44 Unable to create account')
          tHook.getWebhook.sendMessage(msg.chat.id, 'Error creating account')
          throw e
        }

        // Message tracker.
        // Implement message tracker to see message cound and last active time
      } else if (msg.chat.type === 'group') {
        tHook.getWebhook.sendMessage(
          msg.chat.id,
          'Group conversations are temporarily disabled.'
        )
      } else {
        logger.error('Unhandled telegram message action')
        tHook.getWebhook.sendMessage(
          msg.chat.id,
          'ERROR: Unhandled telegram message action'
        )
      }
    } catch (e) {
      logger.error('FATAL: An unknown error occurred: ')
      tHook.getWebhook.sendMessage(
        msg.chat.id,
        'An error occured. Please try again later.'
      )
      throw e
    }
  })

  tHook.getWebhook.on('callback_query', async function(callback) {
    await tHook.getWebhook.answerCallbackQuery(callback.id)
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

  process.on('SIGINT', async function() {
    logger.info('Ending process...')
    logger.info('closing sql')
    await new DB().close()
    await cacheConnection.close()
    await closeQueues()
    // await jobs.stop()
    process.exit(0)
  })
})()
