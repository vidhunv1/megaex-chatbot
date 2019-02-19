import * as NodeTelegramBot from 'node-telegram-bot-api'
import { CONFIG } from '../config'

export class TelegramHook {
  static instance: TelegramHook
  bot!: NodeTelegramBot

  constructor() {
    if (TelegramHook.instance) {
      return TelegramHook.instance
    }

    this.bot = new NodeTelegramBot(CONFIG.TELEGRAM_ACCESS_TOKEN, {
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

    TelegramHook.instance = this
  }

  get getBot() {
    return this.bot
  }
}

export default new TelegramHook()
