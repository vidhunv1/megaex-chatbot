if (!process.env.NODE_ENV) {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

import * as TelegramBot from 'node-telegram-bot-api'
import logger from './modules/logger'
import telegramHook from './modules/telegram-hook'
import { initializeQueues, closeQueues } from './modules/queue'
import { DB } from './modules/db'
import { Cache } from './modules/cache'
import { Account } from './lib/accounts'
import TelegramHandler from './t-conversation/router'
import { expirySubscription } from './t-conversation/subscriptions'
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
  const tBot = telegramHook.getBot()
  // Postgres Init
  await new DB().init()
  cacheConnection.subscribeKeyExpiry(expirySubscription)
  // Cron Jobs
  // const jobs = new Jobs()
  // jobs.start()

  /* 
    TEST code:
  */
  /*
  END
  */

  const tMessageHandler = new TelegramHandler()
  tBot.on('message', async function onMessage(msg: TelegramBot.Message) {
    try {
      if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
        const account = new Account(msg.from.id, msg.from)

        try {
          const telegramAccount = await account.createOrGetAccount()
          tMessageHandler.handleMessage(
            msg,
            telegramAccount.user,
            telegramAccount
          )
        } catch (e) {
          tBot.sendMessage(msg.chat.id, 'Error creating account')
          throw e
        }

        // Message tracker.
        // Implement message tracker to see message cound and last active time
      } else if (msg.chat.type === 'group') {
        tBot.sendMessage(
          msg.chat.id,
          'Group conversations are temporarily disabled.'
        )
      } else {
        logger.error('Unhandled telegram message action')
        tBot.sendMessage(
          msg.chat.id,
          'ERROR: Unhandled telegram message action'
        )
      }
    } catch (e) {
      logger.error('FATAL: An unknown error occurred: ')
      tBot.sendMessage(msg.chat.id, 'An error occured. Please try again later.')
      throw e
    }
  })

  tBot.on('callback_query', async function(callback) {
    await tBot.answerCallbackQuery(callback.id)
    const msg: TelegramBot.Message = callback.message

    const telegramAccount = await new Account(
      msg.chat.id,
      undefined
    ).createOrGetAccount()
    tMessageHandler.handleCallbackQuery(
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
