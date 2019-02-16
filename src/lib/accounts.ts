import cacheConnection from '../modules/cache'
import * as TelegramBot from 'node-telegram-bot-api'
import logger from '../modules/logger'

import { CacheKeys } from '../cache-keys'
import { User, TelegramAccount, Wallet } from '../models'

export class Account {
  keys: KeysInterface
  telegramId: number
  telegramMessage: TelegramBot.Message['from']

  /* 
    NOTE:
    telegramMessage contains info for creating new account. 
    If you are sure the user exists in DB then only telegram ID needs to be passed
   */
  constructor(
    telegramId: number,
    telegramMessage: TelegramBot.Message['from']
  ) {
    this.telegramId = telegramId
    this.keys = new CacheKeys(telegramId).getKeys()
    this.telegramMessage = telegramMessage
  }

  private async saveToCache(tAccount: TelegramAccount) {
    const cacheClient = await cacheConnection.getCacheClient()
    cacheClient.setAsync(
      this.keys.telegramAccount.key,
      JSON.stringify(tAccount),
      'EX',
      this.keys.telegramAccount.expiry
    )
  }

  // This will create account if it does not exist
  async createOrGetAccount(): Promise<TelegramAccount> {
    const cacheClient = await cacheConnection.getCacheClient()

    const accountCache = await cacheClient.getAsync(
      this.keys.telegramAccount.key
    )
    if (accountCache) {
      console.log('From cache')
      // user exists in cache

      const parsed: TelegramAccount = JSON.parse(accountCache)
      const t: TelegramAccount = new TelegramAccount(parsed)
      t.user = new User(parsed.user)

      return t
    } else {
      // no user data available in cache
      // check if user exists
      const getTAccount = await TelegramAccount.findById(this.telegramId, {
        include: [{ model: User }]
      })

      if (getTAccount) {
        console.log('From DB')
        this.saveToCache(getTAccount)
        return getTAccount
      } else {
        console.log('Creating new User')
        if (!this.telegramMessage) {
          logger.error(
            'FATAL: lib/accounts Account details not passed to create new account'
          )
        }

        // new user, create account & load cache
        const newT = new TelegramAccount({
          id: this.telegramId,
          firstName: this.telegramMessage && this.telegramMessage.first_name,
          lastName: this.telegramMessage && this.telegramMessage.last_name,
          languageCode:
            this.telegramMessage && this.telegramMessage.language_code,
          username: this.telegramMessage && this.telegramMessage.username
        })
        try {
          logger.info('Creating new account...')
          const t = await newT.create()
          t.user.id = t.userId

          // create all wallets for user
          const wallets = new Wallet({ userId: t.user.id })
          await wallets.createAll()

          this.saveToCache(t)
          return t
        } catch (e) {
          logger.error(
            'Error creating account: TelegramUser.create: ' + JSON.stringify(e)
          )
          throw new Error('Error creating account')
        }
      }
    }
  }
}
