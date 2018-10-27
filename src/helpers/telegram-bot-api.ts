import * as TelegramBot from "node-telegram-bot-api";
import * as AppConfig from "../../config/app.json";
let env = process.env.NODE_ENV || "development";
export default class TelegramBotApi {
  static instance: TelegramBotApi;
  bot!: TelegramBot;

  constructor() {
    if (TelegramBotApi.instance) return TelegramBotApi.instance;

    this.bot = new TelegramBot((<any>AppConfig)[env]["telegram_access_token"], {
      webHook: {
        port: (<any>AppConfig)[env]["telegram_bot_port"],
        key: "",
        cert: "",
        pfx: ""
      }
    });

    this.bot.setWebHook(
      `${(<any>AppConfig)[env]["telegram_bot_url"] +
        ":" +
        (<any>AppConfig)[env]["telegram_bot_port"]}/bot${
        (<any>AppConfig)[env]["telegram_access_token"]
      }`
    );

    TelegramBotApi.instance = this;
  }

  getBot() {
    return this.bot;
  }
}
