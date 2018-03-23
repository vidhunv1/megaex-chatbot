import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from './telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import CacheStore from '../cache-keys'

export default class TMHandler {
  static instance: TMHandler
  tBot!: TelegramBot;
  keyboardMenu!: (user:User) => TelegramBot.KeyboardButton[][];
  constructor() {
    if (TMHandler.instance)
      return TMHandler.instance;

    this.keyboardMenu = (user:User) => {
      return [
        [{ text: user.__('wallet') }, { text: user.__('buy_sell') }],
        [{ text: user.__('info') }, { text: user.__('settings') }]
      ]
    }
    this.tBot = (new TelegramBotApi()).getBot();;
    this.initCallbacks()
    TMHandler.instance = this;
  }

  initCallbacks() { }

  async handleMessage(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (!user.isTermsAccepted) {
      this.onboardUser(msg, user, tUser);
    } else {
      this.isBotCommand(msg) && await this.handleBotCommand(msg, user, tUser);

      if(msg.text && msg.text === user.__('wallet')) {
        this.handleWallet(msg, user, tUser);
      } else if(msg.text && msg.text === user.__('buy_sell')) {
        this.handleBuySell(msg, user, tUser)
      } else if(msg.text && msg.text === user.__('info')) {
        this.handleInfo(msg, user, tUser)
      } else if(msg.text && msg.text === user.__('settings')) {
        this.handleSettings(msg, user, tUser)
      } else {
        this.tBot.sendMessage(msg.chat.id, user.__('unknown_message'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: this.keyboardMenu(user),
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }); 
      }
    }
  }

  async handleWallet(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    let btcAmount = (0.1).toLocaleString(tUser.languageCode, {minimumFractionDigits: 4});
    let fiatAmount = (123412).toLocaleString(tUser.languageCode);
    let message = user.__('show_wallet_balance %s %s %s %s', 'btc', user.__('btc_full').replace(/\b\w/g, l => l.toUpperCase()), btcAmount, fiatAmount) 
    this.tBot.sendMessage(msg.chat.id, message,  {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  async handleBuySell(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('buy_sell'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  async handleInfo(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('info'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  async handleSettings(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('settings'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  async onboardUser(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (msg.text && this.isBotCommand(msg)) {
      await this.handleBotCommand(msg, user, tUser);
      this.tBot.sendMessage(msg.chat.id, user.__('get_started_guide %s', tUser.firstName), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('continue') }]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } else if (msg.text && msg.text === user.__('i_agree')) {
      await User.update(
        { isTermsAccepted: true },
        { where: { id: tUser.userId } }
      )
      await ((new CacheStore(tUser.id)).clearUserCache());
      this.tBot.sendMessage(msg.chat.id, user.__('initial_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: this.keyboardMenu(user),
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    } else {
      this.tBot.sendMessage(msg.chat.id, user.__('tc_privacy'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('i_agree') }]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      });
    }
  }

  async handleBotCommand(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    await this.tBot.sendMessage(msg.chat.id, '[TODO] HANDLE BOT COMMAND', {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [[{ text: user.__('continue') }]],
        one_time_keyboard: true,
        resize_keyboard: true
      }
    });
  }

  isBotCommand(msg: TelegramBot.Message) {
    return (msg.text && msg.entities && msg.entities[0].type === 'bot_command')
  }

}