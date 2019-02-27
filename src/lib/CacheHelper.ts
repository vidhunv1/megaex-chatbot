import cacheClient from '../modules/Cache'
import logger from '../modules/Logger'
import { State } from '../types'

export const KEY_SEPERATOR = ':'

export enum ChatContext {
  Signup = 'signup'
}

export enum CacheKey {
  TelegramAccount = 't-account',
  Context = 't-context',
  State = 't-state'
}

export const CacheExpiry: Record<CacheKey, number | null> = {
  [CacheKey.TelegramAccount]: 60 * 60,
  [CacheKey.Context]: null,
  [CacheKey.State]: null
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

  async clearUserCache(id: number) {
    await cacheClient.delAsync(this.getKeyForUser(CacheKey.TelegramAccount, id))
  },

  async setContext(context: ChatContext, id: number) {
    await cacheClient.setAsync(
      this.getKeyForUser(CacheKey.Context, id),
      context
    )
  },

  async setState(state: State<any>, id: number) {
    await cacheClient.setAsync(
      this.getKeyForUser(CacheKey.State, id),
      JSON.stringify(state)
    )
  },

  async getContext(id: number): Promise<ChatContext | null> {
    return (await cacheClient.getAsync(
      this.getKeyForUser(CacheKey.Context, id)
    )) as ChatContext
  },

  async getState<T>(id: number): Promise<State<T>> {
    return JSON.parse(
      (await cacheClient.getAsync(this.getKeyForUser(CacheKey.State, id))) ||
        '{}'
    )
  }
}
