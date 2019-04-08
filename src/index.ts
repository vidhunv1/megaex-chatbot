if (!process.env.NODE_ENV) {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

require('module-alias/register')

import db from 'modules/DB'
import cacheConnection from 'modules/Cache'
import * as TelegramBot from 'node-telegram-bot-api'
import tHook from 'modules/TelegramHook'
import { Account } from 'lib/Account'
import { Router } from 'chats/router'
import logger from 'modules/Logger'
;(async () => {
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
          tHook.getWebhook.sendMessage(msg.chat.id, 'Error screating account')
          throw e
        }
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

    await db.close()
    await cacheConnection.close()
    // await jobs.stop()
    process.exit(0)
  })
})()
