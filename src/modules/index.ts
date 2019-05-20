import { Cache } from './cache'
import { Logger } from './Logger'
import { TelegramHook } from './TelegramHook'
import { DB as DataBase } from './DB'
import { I18n } from './i18n'

export const logger = new Logger().getLogger
export * from './RpcClient'
export const telegramHook = new TelegramHook()
export const db = new DataBase()
export const i18n = new I18n()
export const cacheConnection = new Cache()
