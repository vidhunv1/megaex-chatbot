import { Cache } from './cache'
import { Logger } from './logger'
import { TelegramHook } from './telegramHook'
import { DB as DataBase } from './db'
import { I18n } from './i18n'
import { AMQP } from './amqp'

export const logger = new Logger().getLogger
export * from './rpcClient'
export const telegramHook = new TelegramHook()
export const db = new DataBase()
export const i18n = new I18n()
export const cacheConnection = new Cache()
export const amqp = new AMQP()
