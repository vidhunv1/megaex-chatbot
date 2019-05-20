import { cacheConnection } from 'modules'
import { logger } from 'modules'
import { State } from 'chats/types'

export const KEY_SEPERATOR = ':'

export enum CacheKey {
  TelegramAccount = 't-account',
  Context = 't-context',
  State = 't-state'
}

const cacheKeys = Object.values(CacheKey)

/* 
  CacheHelper for all redis keys associated with User.

  Keys take the form `${CACHE_KEY_NAME}:${id}`
*/
export const CacheHelper = {
  // Get Key: t-account:1 => 1
  getIdFromKey(key: string) {
    const id = key.split(KEY_SEPERATOR)[1]
    if (!id || id === '') {
      logger.error(
        'Id is not available, maybe you passed undefined id when accessing id'
      )
      throw new Error('Id not passed in CacheKeys')
    }
    return id
  },

  getNormalizedKey(formattedKey: string) {
    if (formattedKey.includes(KEY_SEPERATOR)) {
      return formattedKey.split(KEY_SEPERATOR)[0]
    } else {
      return formattedKey
    }
  },

  getKeyForUser(key: CacheKey, id: number) {
    return `${key}${KEY_SEPERATOR}${id}`
  },

  isValidKey(key: string) {
    const normalizedKey = this.getNormalizedKey(key)

    return cacheKeys.includes(normalizedKey)
  },

  async setState(state: State<any>, id: number, expiry?: number) {
    if (expiry && expiry > 0) {
      await cacheConnection.getClient.setAsync(
        this.getKeyForUser(CacheKey.State, id),
        JSON.stringify(state),
        'EX',
        expiry
      )
    } else {
      await cacheConnection.getClient.setAsync(
        this.getKeyForUser(CacheKey.State, id),
        JSON.stringify(state)
      )
    }
  },

  async clearState(id: number) {
    await cacheConnection.getClient.delAsync(
      this.getKeyForUser(CacheKey.State, id)
    )
  },

  async getState<T>(id: number): Promise<T | null> {
    const state = await cacheConnection.getClient.getAsync(
      this.getKeyForUser(CacheKey.State, id)
    )
    if (state != null) {
      return JSON.parse(state)
    }
    return null
  }
}
