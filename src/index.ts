if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
  console.log('Using environment variable from .env')
  require('dotenv').config()
} else {
  console.log('Using system environment variables')
}

require('module-alias/register')

import { db } from 'modules'
import { cacheConnection } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import { telegramHook } from 'modules'
import { Account } from 'lib/Account'
import { Router } from 'chats/router'
import { logger } from 'modules'
;(async () => {
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
          Router.routeMessage(msg, telegramAccount.user, telegramAccount)
        } catch (e) {
          logger.error('index.ts#44 Unable to create account')
          telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            'Error screating account'
          )
          throw e
        }
      } else if (msg.chat.type === 'group') {
        telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          'Group conversations are temporarily disabled.'
        )
      } else {
        logger.error('Unhandled telegram message action')
        telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          'ERROR: Unhandled telegram message action'
        )
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
    await telegramHook.getWebhook.answerCallbackQuery(callback.id)
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
