if (!process.env.NODE_ENV) {
  require('dotenv').config()
}

import * as TelegramBot from 'node-telegram-bot-api'
import TelegramBotApi from './lib/telegram-bot-api'
import MessageQueue from './lib/message-queue'

import User from './models/user'
import TelegramUser from './models/telegram_user'
import Wallet from './models/wallet'
import Jobs from './jobs'

import CacheKeys from './cache-keys'
import Logger from './lib/logger'
import TelegramHandler from './t-conversation/router'

import database from './modules/db'
import cacheConnection from './modules/cache'
import { expirySubscription } from './t-conversation/subscriptions'

const logger = new Logger().getLogger()

;(async () => {
  await database.init()
  await cacheConnection.init()

  cacheConnection.subscribeKeyExpiry(expirySubscription)

  const redisClient = await cacheConnection.getCacheClient()
  const tBot = new TelegramBotApi().getBot()
  const messageQueue = new MessageQueue()
  const tMessageHandler = new TelegramHandler()
  const jobs = new Jobs()
  jobs.start()

  tBot.on('message', async function onMessage(msg: TelegramBot.Message) {
    try {
      const rKeys = new CacheKeys(msg.chat.id).getKeys()
      if (msg.from && msg.chat && msg.chat.id === msg.from.id) {
        await tBot.sendChatAction(msg.chat.id, 'typing')
        const userCache = await redisClient.getAsync(rKeys.telegramUser.key)

        let tUser: TelegramUser, user: User
        if (userCache) {
          // user exists in redis cache
          const cache: TelegramUser = JSON.parse(userCache)
          tUser = new TelegramUser(cache)
          user = new User(cache.user)
          console.log('UserCache: ' + JSON.stringify(cache))
        } else {
          // no user data available in cache
          // check if user exists
          const getTUser = await TelegramUser.findById(msg.from.id, {
            include: [{ model: User }]
          })
          if (!getTUser) {
            // new user, create account & load cache
            const newT = new TelegramUser({
              id: msg.from.id,
              firstName: msg.from.first_name,
              lastName: msg.from.last_name,
              languageCode: msg.from.language_code,
              username: msg.from.username
            })
            try {
              logger.info('Creating new account...')
              tUser = await newT.create()
              tUser.user.id = tUser.userId
              user = tUser.user
            } catch (e) {
              logger.error(
                'Error creating account: TelegramUser.create: ' +
                  JSON.stringify(e)
              )
              tBot.sendMessage(msg.chat.id, new User().__('error_unknown'))
              return
            }
            // create all wallets for user
            const wallets = new Wallet({ userId: tUser.user.id })
            wallets.create()
          } else {
            tUser = getTUser
            user = tUser.user
          }
          console.log('SAVING TO CACHE: ' + JSON.stringify(tUser))
          redisClient.setAsync(
            rKeys.telegramUser.key,
            JSON.stringify(tUser),
            'EX',
            rKeys.telegramUser.expiry
          )
        }
        tMessageHandler.handleMessage(msg, user, tUser)

        if (
          (await redisClient.existsAsync(rKeys.messageCounter.shadowKey)) == 1
        ) {
          await redisClient.incrAsync(rKeys.messageCounter.key)
        } else {
          await redisClient.setAsync(rKeys.messageCounter.key, 1)
          await redisClient.setAsync(
            rKeys.messageCounter.shadowKey,
            '',
            'EX',
            rKeys.messageCounter.expiry
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
    let tUser: TelegramUser | null = null
    let user: User | null = null
    const cacheKeys = new CacheKeys(msg.chat.id).getKeys()
    const userCache = await redisClient.getAsync(cacheKeys.telegramUser.key)

    if (userCache) {
      // user exists in redis cache
      const cache: TelegramUser = JSON.parse(userCache)
      tUser = new TelegramUser(cache)
      user = new User(cache.user)
    } else {
      // get from db
      try {
        tUser = await TelegramUser.findById(msg.chat.id, {
          include: [{ model: User }]
        })
        user = tUser ? tUser.user : null
      } catch (e) {
        logger.error('FATAL: could not get user details')
      }
    }

    if (tUser && user) {
      tMessageHandler.handleCallbackQuery(
        callback.message,
        user,
        tUser,
        callback
      )
    } else {
      logger.error('FATAL: user does not exist when it should have')
    }
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
