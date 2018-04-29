import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from '../helpers/telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import CacheStore from '../cache-keys'
import Store from '../helpers/store'
import Logger from '../helpers/logger'
import NotificationManager from '../helpers/notification-manager'
import { isBotCommand, parseCallbackQuery, keyboardMenu, sendErrorMessage } from './defaults';

//conversation routes
import { walletConversation, walletCallback, walletContext } from './wallet';
import { settingsConversation, settingsCallback, settingsContext } from './settings';
import { tradeConversation, tradeCallback, tradeContext } from './trade';
import { infoConversation, infoCallback, infoContext } from './info';
import { accountConversation, accountCallback, accountContext } from './account';
import I18n from '../helpers/i18n';
import Market from '../models/market';
export default class TMHandler {
  static instance: TMHandler
  tBot!: TelegramBot;
  redisClient: any
  logger: any
  notificationManager!: NotificationManager

  constructor() {
    if (TMHandler.instance)
      return TMHandler.instance;
    this.logger = (new Logger()).getLogger()
    this.redisClient = (new Store()).getClient();
    this.notificationManager = new NotificationManager();

    this.tBot = (new TelegramBotApi()).getBot();
    TMHandler.instance = this;
  }

  async handleCallbackQuery(msg: TelegramBot.Message, user: User, tUser: TelegramUser, callback: TelegramBot.CallbackQuery) {
    let query: CallbackQuery = callback.data ? parseCallbackQuery(callback.data) : parseCallbackQuery('');
    let isCallbackHandled: boolean =
      await walletCallback(msg, user, tUser, query) ||
      await tradeCallback(msg, user, tUser, query) ||
      await infoCallback(msg, user, tUser, query) ||
      await settingsCallback(msg, user, tUser, query) ||
      await accountCallback(msg, user, tUser, query);

    if (!isCallbackHandled) {
      this.logger.error("Callback not defined: " + JSON.stringify(query));
    }
  }

  async handleMessage(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (!user.isTermsAccepted || !user.currencyCode) {
      if(isBotCommand(msg)) {
        this.handleConversations(msg, user, tUser);
      }
      this.onboardUser(msg, user, tUser);
    } else {
      this.handleConversations(msg, user, tUser);
    }
  }

  private async handleConversations(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    let isConversationHandled: boolean =
      await walletConversation(msg, user, tUser) ||
      await tradeConversation(msg, user, tUser) ||
      await infoConversation(msg, user, tUser) ||
      await settingsConversation(msg, user, tUser) ||
      await accountConversation(msg, user, tUser);

    if (!isConversationHandled && msg.text && !msg.text.startsWith('/start')) {
      let currentContext;
      let cacheKeys = (new CacheStore(tUser.id)).getKeys();
      [currentContext] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);

      let isContextHandled: boolean =
        await this.handleBaseContext(msg, user, tUser, currentContext) ||
        await walletContext(msg, user, tUser, currentContext) ||
        await tradeContext(msg, user, tUser, currentContext) ||
        await infoContext(msg, user, tUser, currentContext) ||
        await settingsContext(msg, user, tUser, currentContext) ||
        await accountContext(msg, user, tUser, currentContext)

      if (!isContextHandled) {
        this.tBot.sendMessage(msg.chat.id, user.__('unknown_message'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        });
      }
    } else if(!isConversationHandled && isBotCommand(msg) && user.isTermsAccepted && user.currencyCode && msg.text && msg.text.startsWith('/start')) {
      this.tBot.sendMessage(msg.chat.id, user.__('initial_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      }); 
    } else if(!isConversationHandled && user.isTermsAccepted && user.currencyCode){
      sendErrorMessage(user, tUser);
    }
  }

  async onboardUser(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    let languagesList = I18n.getAvailableLanguages();
    let currencyList = Market.getFiatCurrencies();
    let ccKeyboardButton:TelegramBot.ReplyKeyboardMarkup = { keyboard: [], one_time_keyboard: false, resize_keyboard: true };
    let getCurrencyCode = function(currency:string):string|null {
      for(let i=0; i<currencyList.length; i++) {
        if(currencyList[i].name === currency)
          return currencyList[i].code;
      }
      return null;
    }

    if (msg.text && isBotCommand(msg)) { // entry point
      let langKeyboardButton:TelegramBot.ReplyKeyboardMarkup = { keyboard: [], one_time_keyboard: false, resize_keyboard: true }, i=0;
      while(i < languagesList.length) {
        langKeyboardButton.keyboard.push([{text: languagesList[i].name}])
        if(++i >= languagesList.length)
          break;
        langKeyboardButton.keyboard[langKeyboardButton.keyboard.length-1].push({text: languagesList[i].name});
        i++;
      }

      this.tBot.sendMessage(msg.chat.id, '*Hello '+tUser.firstName+'*. Select your *language* from the options below.', {
        parse_mode: 'Markdown',
        reply_markup: langKeyboardButton
      });
    } else if(msg.text && I18n.getLanguageCode(msg.text)!=null) {
      let langCode = I18n.getLanguageCode(msg.text) 
      await User.update(
        { locale:  langCode},
        { where: { id: tUser.userId } }
      )
      await ((new CacheStore(tUser.id)).clearUserCache());
      user.locale = langCode || 'en';
      await this.tBot.sendMessage(msg.chat.id, user.__('get_started_guide'), {
        parse_mode: 'Markdown',
      });
      
      await this.tBot.sendMessage(msg.chat.id, user.__('tc_privacy'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('i_agree') }]],
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
     
      let i=0;
      while(i < currencyList.length) {
        ccKeyboardButton.keyboard.push([{text: currencyList[i].name}])
        if(++i >= currencyList.length)
          break;
        ccKeyboardButton.keyboard[ccKeyboardButton.keyboard.length-1].push({text: currencyList[i].name});
        if(++i >= currencyList.length)
          break;
        ccKeyboardButton.keyboard[ccKeyboardButton.keyboard.length-1].push({text: currencyList[i].name});
        i++;
      }
      
      this.tBot.sendMessage(msg.chat.id, user.__('select_currency'), {
        parse_mode: 'Markdown',
        reply_markup: ccKeyboardButton
      });
    } else if(msg.text && getCurrencyCode(msg.text)!=null) {
      await User.update(
        { currencyCode:  getCurrencyCode(msg.text)},
        { where: { id: tUser.userId } }
      )
      await ((new CacheStore(tUser.id)).clearUserCache());
      this.tBot.sendMessage(msg.chat.id, user.__('initial_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
    } else {
      this.tBot.sendMessage(msg.chat.id, user.__('select_currency'), {
        parse_mode: 'Markdown',
        reply_markup: ccKeyboardButton
      });
    }
  }

  async handleBaseContext(msg: TelegramBot.Message, user: User, tUser: TelegramUser, context:string):Promise<boolean> {
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    if(context && context!='' && msg.text === user.__('/cancel')) {
      await this.redisClient.delAsync(cacheKeys.tContext.key); 
      this.tBot.sendMessage(tUser.id, user.__('context_action_cancelled'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
      return true;
    }
    return false;
  }
}