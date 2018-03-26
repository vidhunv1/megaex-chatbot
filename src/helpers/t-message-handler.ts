import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from './telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import CacheStore from '../cache-keys'
import Store from './store'
import Wallet from '../models/wallet';
import Logger from './logger'

export default class TMHandler {
  static instance: TMHandler
  tBot!: TelegramBot;
  keyboardMenu!: (user: User) => TelegramBot.KeyboardButton[][];
  redisClient: any
  logger: any

  constructor() {
    if (TMHandler.instance)
      return TMHandler.instance;
    this.logger = (new Logger()).getLogger()
    this.redisClient = (new Store()).getClient();
    this.keyboardMenu = (user: User) => {
      return [
        [{ text: user.__('wallet') }, { text: user.__('buy_sell') }],
        [{ text: user.__('info') }, { text: user.__('settings') }]
      ]
    }

    this.tBot = (new TelegramBotApi()).getBot();;
    TMHandler.instance = this;
  }
  async handleCallbackQuery(msg: TelegramBot.Message, user: User, tUser: TelegramUser, callback: TelegramBot.CallbackQuery) {
    console.log("Callback Data: " + JSON.stringify(user), JSON.stringify(tUser), JSON.stringify(msg));
    let query: CallbackQuery = callback.data ? this.parseCallbackQuery(callback.data) : this.parseCallbackQuery('');
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    switch (query.callbackFunction) {
      case 'coinSend':
        this.tBot.sendMessage(tUser.id, '[TODO] Handle coin send', {
          parse_mode: 'Markdown',
        });
        break;
      case 'newAddress':
        await this.tBot.sendChatAction(msg.chat.id, 'typing');
        let cCoin, newAddress = null;
        [cCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["wallet.coin"]);
        if (cCoin) {
          let wallet = await Wallet.findOne({ where: { currencyCode: cCoin, userId: user.id } });
          if (wallet) {
            newAddress = await wallet.newAddress();
          }
        }
        if (newAddress) {
          await this.tBot.sendMessage(tUser.id, user.__('new_address_generated %s', this.toTitleCase(user.__n(cCoin, 1))), {
            parse_mode: 'Markdown',
          });
          this.sendCurrentAddress(user, tUser, null);
        } else {
          this.tBot.sendMessage(tUser.id, user.__('error_new_address'), {
            parse_mode: 'Markdown',
          });
        }
        break;
      case 'qrCode':
        if (query.qrCode) {
          this.tBot.sendMessage(tUser.id, '[TODO] Send QR Code for ' + query.qrCode.coin + ', ' + query.qrCode.address, {
            parse_mode: 'Markdown',
          });
        } else {
          this.logger.error("Error with sending qr code: "+JSON.stringify(query));
          this.tBot.sendMessage(tUser.id, user.__('error_unknown'), {
            parse_mode: 'Markdown',
          });
        }
        break;
      case 'coinAddress':
        await this.tBot.sendChatAction(msg.chat.id, 'typing');
        let curCoin;
        [curCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["wallet.coin"]);
        await this.tBot.sendMessage(tUser.id, user.__('show_address_header %s', this.toTitleCase(user.__n(curCoin, 1))), {
          parse_mode: 'Markdown',
        });
        this.sendCurrentAddress(user, tUser, null);
        break;
      case 'coinWithdraw':
        this.tBot.sendMessage(tUser.id, '[TODO] Handle coin withdraw', {
          parse_mode: 'Markdown',
        });
        break;
      case 'paginate':
        let showCoin;
        if (query.paginate && query.paginate.action === 'next') {
          console.log("NEXT");
          let nextIndex = +(query.paginate.currentPage) - 1;
          nextIndex++;
          if (nextIndex > (Wallet.getCurrencyCodes().length - 1))
            nextIndex = 0;
          showCoin = Wallet.getCurrencyCodes()[nextIndex];
        } else if (query.paginate && query.paginate.action === 'prev') {
          console.log("PREV");
          let prevIndex = +(query.paginate.currentPage) - 1;
          prevIndex--;
          if (prevIndex < 0)
            prevIndex = (Wallet.getCurrencyCodes().length - 1);
          showCoin = Wallet.getCurrencyCodes()[prevIndex];
        } else {
          showCoin = Wallet.getCurrencyCodes()[0];
        }
        console.log("Setting cache: " + showCoin);
        await this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["wallet.coin"], showCoin);
        msg.message_id = query.messageId;
        console.log("Paginate: " + JSON.stringify(msg));
        this.handleWallet(msg, user, tUser);
        break;
      default:
        this.logger.error("No match for callback query");
    }
  }

  async handleMessage(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (!user.isTermsAccepted) {
      this.onboardUser(msg, user, tUser);
    } else {
      this.isBotCommand(msg) && await this.handleBotCommand(msg, user, tUser);

      if (msg.text && msg.text === user.__('wallet')) {
        this.handleWallet(msg, user, tUser);
      } else if (msg.text && msg.text === user.__('buy_sell')) {
        this.handleBuySell(msg, user, tUser)
      } else if (msg.text && msg.text === user.__('info')) {
        this.handleInfo(msg, user, tUser)
      } else if (msg.text && msg.text === user.__('settings')) {
        this.handleSettings(msg, user, tUser)
      } else {
        this.tBot.sendMessage(msg.chat.id, user.__('unknown_message'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: this.keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        });
      }
    }
  }

  async handleWallet(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    console.log("MESSAGE: " + JSON.stringify(msg));
    const CONTEXT = 'wallet';
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    let currentContext, currentCoin, currentPage;
    [currentContext, currentCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, cacheKeys.tContext["wallet.coin"]);
    currentPage = (Wallet.getCurrencyCodes().indexOf(currentCoin) + 1);
    console.log("Wallet: " + currentContext + ", " + currentCoin + ", " + currentPage);
    if (!currentCoin)
      currentCoin = Wallet.getCurrencyCodes()[0];

    let coinAmount = (0.1).toLocaleString(tUser.languageCode, { minimumFractionDigits: 4 });
    let fiatAmount = (1234213112).toLocaleString(tUser.languageCode);
    let message = user.__('show_wallet_balance %s %s %s %s', this.toTitleCase(user.__n(currentCoin, 1)), coinAmount, currentCoin.toUpperCase(), fiatAmount)
    let inlineMessageId = (msg.from && msg.from.is_bot) ? msg.message_id : msg.message_id + 1;
    console.log("InlineMessageId: " + inlineMessageId);
    let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
      inline_keyboard: [
        [{ text: user.__('send %s', this.toTitleCase(user.__n(currentCoin, 1))), callback_data: this.stringifyCallbackQuery('coinSend', inlineMessageId, { coin: currentCoin }) }],
        [
          { text: user.__('my_address'), callback_data: this.stringifyCallbackQuery('coinAddress', inlineMessageId, { coin: currentCoin }) },
          { text: user.__('withdraw'), callback_data: this.stringifyCallbackQuery('coinWithdraw', inlineMessageId, { coin: currentCoin }) }
        ],
        [
          { text: this.toTitleCase(user.__('prev')), callback_data: this.stringifyCallbackQuery('paginate', inlineMessageId, { action: 'prev', currentPage }) },
          { text: user.__('pagination %s %d %d', currentCoin.toUpperCase(), currentPage, Wallet.getCurrencyCodes().length), callback_data: this.stringifyCallbackQuery('paginate', inlineMessageId, { action: 'refresh', currentPage }) },
          { text: this.toTitleCase(user.__('next')), callback_data: this.stringifyCallbackQuery('paginate', (inlineMessageId), { action: 'next', currentPage }) }]
      ]
    }

    if (msg.from && msg.from.is_bot) { //callback query
      await this.tBot.editMessageText(message, {
        parse_mode: 'Markdown',
        chat_id: tUser.id, message_id: msg.message_id,
        reply_markup: inlineKeyboard
      });
    } else {
      await this.tBot.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard
      });
    }
    if (!currentContext || currentContext !== CONTEXT) {
      this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, CONTEXT);
    }
  }

  async handleBuySell(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('buy_sell'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });
  }

  async handleInfo(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    await this.tBot.sendMessage(msg.chat.id, 'Welcome: ' + JSON.stringify(user), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });

    await this.tBot.sendMessage(msg.chat.id, 'Welcome: ' + JSON.stringify(tUser), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });
  }

  async handleSettings(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('settings'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });
  }

  async handleError(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
    this.tBot.sendMessage(msg.chat.id, user.__('error_unknown'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: this.keyboardMenu(user),
        one_time_keyboard: false,
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
          one_time_keyboard: false,
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
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
    } else {
      this.tBot.sendMessage(msg.chat.id, user.__('tc_privacy'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('i_agree') }]],
          one_time_keyboard: false,
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
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });
  }

  async sendCurrentAddress(user: User, tUser: TelegramUser, deleteMessageId: number | null = null) {
    let currentCoin;
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    [currentCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["wallet.coin"]);
    console.log("Getting wallet for: " + currentCoin);
    let wallet: Wallet | null = await Wallet.findOne({ attributes: ['address', 'currencyCode'], where: { currencyCode: currentCoin, userId: user.id } })

    if (wallet) {
      await this.tBot.sendMessage(tUser.id, '*' + wallet.address + '*', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: user.__('new_address'), callback_data: this.stringifyCallbackQuery('newAddress', deleteMessageId, { coin: currentCoin }) },
              { text: user.__('qr_code'), callback_data: this.stringifyCallbackQuery('qrCode', null, { coin: currentCoin, address: wallet.address }) }],
            [{ text: user.__('address_info'), url: 'https://google.com' }]
          ]
        }
      });
    } else {
      this.logger.error("No wallet address available: " + currentCoin);
      this.tBot.sendMessage(tUser.id, 'An error occured, please try again later', {
        parse_mode: 'Markdown',
      });
    }
  }

  isBotCommand(msg: TelegramBot.Message) {
    return (msg.text && msg.entities && msg.entities[0].type === 'bot_command')
  }

  toTitleCase(s: string) {
    return s.replace(/\b\w/g, l => l.toUpperCase());
  }

  stringifyCallbackQuery(callbackFunction: CallbackQuery["callbackFunction"], messageId: number | null, values: CallbackQuery["coinSend"] | CallbackQuery["coinAddress"] | CallbackQuery["coinWithdraw"] | CallbackQuery["paginate"] | CallbackQuery["back"] | CallbackQuery["qrCode"]) {
    let q = callbackFunction + ':';
    if (messageId)
      q = q + 'messageId=' + messageId + ',';
    let t: any = values;
    Object.keys(t).forEach(function (key) {
      q = q + key + '=' + t[key] + ','
    });
    console.log("BITTON DATA: " + q.substring(0, q.length - 1));
    return q.substring(0, q.length - 1);
  }

  parseCallbackQuery(query: string): CallbackQuery {
    let callbackFunction, obj, pairs: string[], tKey, tVal;
    [callbackFunction, obj] = query.split(':');
    let res: any = { callbackFunction };
    res[callbackFunction] = {};
    pairs = obj.split(',');
    for (let i = 0; i < pairs.length; i++) {
      if (pairs.length > 0) {
        [tKey, tVal] = pairs[i].split('=');
        if (tKey === 'messageId')
          res[tKey] = tVal;
        else
          res[callbackFunction][tKey] = tVal;
      }
    }
    return res;
  }
}