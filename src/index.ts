if (!process.env.NODE_ENV) {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

import database from './modules/db'
import cacheConnection from './modules/cache'

import * as TelegramBot from 'node-telegram-bot-api'
import TelegramHook from './modules/telegram-hook'
import MessageQueue from './lib/message-queue'

import { User } from './models'
import Jobs from './jobs'

import logger from './modules/logger'
import { Account } from './lib/accounts'
import TelegramHandler from './t-conversation/router'

import { expirySubscription } from './t-conversation/subscriptions'

; (async () => {
  // Postgres Init
  await database.init()

  // Redis Init
  await cacheConnection.init()
  cacheConnection.subscribeKeyExpiry(expirySubscription)
  const redisClient = await cacheConnection.getCacheClient()

  // Telegram hook
  const tBot = TelegramHook.getBot()

  // Message Queue
  const messageQueue = new MessageQueue()

  // Cron Jobs
  const jobs = new Jobs()
  jobs.start()

  // Telegram bot incoming message router
  const tMessageHandler = new TelegramHandler()

  tBot.on('message', async function onMessage(msg: TelegramBot.Message) {
    try {
      if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
        const account = new Account(msg.from, msg.from.id)

        try {
          const telegramAccount = await account.createOrGetAccount()
          tMessageHandler.handleMessage(msg, telegramAccount.user, telegramAccount)
        } catch (e) {
          tBot.sendMessage(msg.chat.id, new User().__('error_unknown'))
        }

        // Message tracker.
        // TODO: Update this to also show time, remove expiry
        if (
          (await redisClient.existsAsync(account.keys.messageCounter.shadowKey)) == 1
        ) {
          await redisClient.incrAsync(account.keys.messageCounter.key)
        } else {
          await redisClient.setAsync(account.keys.messageCounter.key, 1)
          await redisClient.setAsync(
            account.keys.messageCounter.shadowKey,
            '',
            'EX',
            account.keys.messageCounter.expiry
          )
        }
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
      logger.error('FATAL: An unknown error occurred: ' + JSON.stringify(e))
      tBot.sendMessage(msg.chat.id, 'An error occured. Please try again later.')
    }
  })

  tBot.on('callback_query', async function(callback) {
    await tBot.answerCallbackQuery(callback.id)
    const msg: TelegramBot.Message = callback.message

    const telegramAccount = await (new Account(undefined, msg.chat.id)).createOrGetAccount()
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
    await database.close()
    await cacheConnection.close()
    await messageQueue.close()
    await jobs.stop()
    process.exit(0)
  })
})()
