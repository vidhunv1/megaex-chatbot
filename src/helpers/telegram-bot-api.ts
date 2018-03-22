import * as TelegramBot from 'node-telegram-bot-api';
import * as AppConfig from '../../config/app.json'

export default class TelegramBotApi {
  static instance: TelegramBotApi;
  bot!: TelegramBot;

  constructor() {
    if (TelegramBotApi.instance)
      return TelegramBotApi.instance;

    this.bot = new TelegramBot((<any>AppConfig)["telegram_access_token"], {
      webHook: {
        port: (<any>AppConfig)["telegram_bot_port"],
        key: '',
        cert: '',
        pfx: ''
      }
    });

    this.bot.setWebHook(`${(<any>AppConfig)["telegram_bot_url"] + ':' + (<any>AppConfig)["telegram_bot_port"]}/bot${(<any>AppConfig)["telegram_access_token"]}`);

    TelegramBotApi.instance = this;
  }

  getBot() {
    return this.bot;
  }
}
