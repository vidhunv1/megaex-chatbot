import * as NodeTelegramBot from 'node-telegram-bot-api'
import { CONFIG } from '../config'
import { logger } from 'modules'

export class TelegramHook {
  static instance: TelegramHook
  private bot!: NodeTelegramBot

  constructor() {
    if (TelegramHook.instance) {
      return TelegramHook.instance
    }

    // if (CONFIG.NODE_ENV === 'development') {
    //   logger.error('Using polling for telegram bot')
    //   this.bot = new NodeTelegramBot(CONFIG.TELEGRAM_ACCESS_TOKEN, {
    //     polling: true
    //   })
    // } else {
    //   logger.info(`Using WebBook ${CONFIG.WEBHOOK_URL} for telegram bot`)
    //   this.bot = new NodeTelegramBot(CONFIG.TELEGRAM_ACCESS_TOKEN, {
    //     webHook: {
    //       // @ts-ignore
    //       port: CONFIG.WEBHOOK_PORT,
    //       healthEndpoint: 'ping'
    //     }
    //   })

    // this.bot.setWebHook(
    //   `${CONFIG.WEBHOOK_URL + ':' + CONFIG.WEBHOOK_PORT}/bot${
    //     CONFIG.TELEGRAM_ACCESS_TOKEN
    //   }`
    // )
    // }

    logger.error(
      'TODO: Enable WebHooks. Currently using polling for telegram bot'
    )
    this.bot = new NodeTelegramBot(CONFIG.TELEGRAM_ACCESS_TOKEN, {
      polling: true
    })

    TelegramHook.instance = this
  }

  get getWebhook() {
    return this.bot
  }
}
