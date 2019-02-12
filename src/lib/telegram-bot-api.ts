import * as TelegramBot from 'node-telegram-bot-api'
import { CONFIG } from '../config'

export default class TelegramBotApi {
  static instance: TelegramBotApi
  bot!: TelegramBot

  constructor() {
    if (TelegramBotApi.instance) {
      return TelegramBotApi.instance
    }

    this.bot = new TelegramBot(CONFIG.TELEGRAM_ACCESS_TOKEN, {
      webHook: {
        // @ts-ignore
        port: CONFIG.WEBHOOK_PORT,
        key: '',
        cert: '',
        pfx: ''
      }
    })

    this.bot.setWebHook(
      `${CONFIG.WEBHOOK_URL + ':' + CONFIG.WEBHOOK_PORT}/bot${
        CONFIG.TELEGRAM_ACCESS_TOKEN
      }`
    )

    TelegramBotApi.instance = this
  }

  getBot() {
    return this.bot
  }
}
