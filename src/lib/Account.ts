import * as TelegramBot from 'node-telegram-bot-api'
import { logger } from 'modules'
import { cacheConnection } from 'modules'
import { User, TelegramAccount, Wallet } from 'models'
import { CacheHelper, CacheKey } from './CacheHelper'

export const ACCOUNT_CACHE_EXPIRY = 60 * 60

export class Account {
  telegramId: number
  telegramMessage: TelegramBot.Message['from']
  /* 
    NOTE:
    telegramMessage contains info for creating new account. 
    If you are sure the user exists in DB then only telegram ID needs to be passed
   */
  constructor(
    telegramId: number,
    telegramMessage?: TelegramBot.Message['from']
  ) {
    this.telegramId = telegramId
    this.telegramMessage = telegramMessage
  }

  private async saveUserToCache(tAccount: TelegramAccount) {
    const cacheClient = await cacheConnection.getClient
    cacheClient.setAsync(
      CacheHelper.getKeyForId(CacheKey.TelegramAccount, tAccount.id),
      JSON.stringify(tAccount),
      'EX',
      ACCOUNT_CACHE_EXPIRY
    )
  }

  static async clearUserCache(id: number) {
    await cacheConnection.getClient.delAsync(
      CacheHelper.getKeyForId(CacheKey.TelegramAccount, id)
    )
  }

  // This will create account if it does not exist
  async createOrGetAccount(): Promise<TelegramAccount> {
    const cacheClient = cacheConnection.getClient
    const accountCache = await cacheClient.getAsync(
      CacheHelper.getKeyForId(CacheKey.TelegramAccount, this.telegramId)
    )

    let tAccount: TelegramAccount
    if (accountCache) {
      // user exists in cache

      const parsed: TelegramAccount = JSON.parse(accountCache)
      const t: TelegramAccount = new TelegramAccount(parsed)
      t.user = new User(parsed.user)

      tAccount = t
    } else {
      // no user data available in cache
      // check if user exists
      const getTAccount = await TelegramAccount.findById(this.telegramId, {
        include: [{ model: User }]
      })

      if (getTAccount) {
        this.saveUserToCache(getTAccount)
        tAccount = getTAccount
      } else {
        logger.info('Creating new User')
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

          tAccount = t
        } catch (e) {
          logger.error(
            'Error creating account: TelegramUser.create: ' + JSON.stringify(e)
          )
          throw new Error('Error creating account')
        }
      }
    }

    if (this.telegramMessage) {
      if (
        this.telegramMessage.username &&
        this.telegramMessage.username !== tAccount.username
      ) {
        await TelegramAccount.update(
          {
            username: this.telegramMessage.username
          },
          {
            where: {
              id: tAccount.id
            }
          }
        )
        Account.clearUserCache(this.telegramId)

        tAccount.username = this.telegramMessage.username
      }

      if (
        this.telegramMessage.first_name &&
        this.telegramMessage.first_name !== tAccount.firstName
      ) {
        await TelegramAccount.update(
          {
            firstName: this.telegramMessage.first_name
          },
          {
            where: {
              id: tAccount.id
            }
          }
        )
        Account.clearUserCache(this.telegramId)

        tAccount.firstName = this.telegramMessage.first_name
      }
    }

    return tAccount
  }
}
