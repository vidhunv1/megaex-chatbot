import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from '../helpers/telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Payment, { PaymentError } from '../models/payment'
import CacheStore from '../cache-keys'
import Store from '../helpers/store'
import Logger from '../helpers/logger'
import NotificationManager from '../helpers/notification-manager'
import { isBotCommand, parseCallbackQuery, sendErrorMessage } from './defaults';

//conversation routes
import { walletConversation, walletCallback, walletContext } from './wallet';
import { settingsConversation, settingsCallback, settingsContext } from './settings';
import { tradeConversation, tradeCallback, tradeContext } from './trade';
import { infoConversation, infoCallback, infoContext } from './info';

export default class TMHandler {
  static instance: TMHandler
  tBot!: TelegramBot;
  keyboardMenu!: (user: User) => TelegramBot.KeyboardButton[][];
  redisClient: any
  logger: any
  notificationManager!:NotificationManager
  WALLET_CONTEXT!: string
  COINSEND_CONTEXT!: string

  constructor() {
    if (TMHandler.instance)
      return TMHandler.instance;
    this.WALLET_CONTEXT = 'Wallet';
    this.COINSEND_CONTEXT = 'CoinSend'
    this.logger = (new Logger()).getLogger()
    this.redisClient = (new Store()).getClient();
    this.notificationManager = new NotificationManager();
    this.keyboardMenu = (user: User) => {
      return [
        [{ text: user.__('wallet') }, { text: user.__('buy_sell') }],
        [{ text: user.__('info') }, { text: user.__('settings') }]
      ]
    }

    this.tBot = (new TelegramBotApi()).getBot();
    TMHandler.instance = this;
  }
  
  async handleCallbackQuery(msg: TelegramBot.Message, user: User, tUser: TelegramUser, callback: TelegramBot.CallbackQuery) {
    let query: CallbackQuery = callback.data ? parseCallbackQuery(callback.data) : parseCallbackQuery('');
    let isCallbackHandled:boolean = await walletCallback(msg, user, tUser, query) || await tradeCallback(msg, user, tUser, query) || await infoCallback(msg, user, tUser, query) || await settingsCallback(msg, user, tUser, query);
    
    if(!isCallbackHandled) { //error
    }
  }

  async handleMessage(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (!user.isTermsAccepted) {
      this.onboardUser(msg, user, tUser);
    } else {
      if (isBotCommand(msg)) {
        await this.handleBotCommand(msg, user, tUser);
        return;
      }
      
      let isMessageHandled:boolean = await walletConversation(msg, user, tUser) || await tradeConversation(msg, user, tUser) || await infoConversation(msg, user, tUser) || await settingsConversation(msg, user, tUser);
      if(!isMessageHandled) {
        let currentContext;
        let cacheKeys = (new CacheStore(tUser.id)).getKeys();
        [currentContext] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);

        let isContextHandled:boolean = await walletContext(msg, user, tUser, currentContext) || await tradeContext(msg, user, tUser, currentContext) || await infoContext(msg, user, tUser, currentContext) || await settingsContext(msg, user, tUser, currentContext);
        if(!isContextHandled) {
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
  }

  async onboardUser(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (msg.text && isBotCommand(msg)) {
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

  async handleBotCommand(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    if (msg.text && msg.text.startsWith('/u') && msg.entities) {
      await this.tBot.sendMessage(msg.chat.id, '[TODO] Show user profile for: ' + (msg.text.substring(msg.entities[0].offset + 2, msg.entities[0].length)), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('continue') }]],
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
    } else if (msg.text && msg.text.startsWith('/start')) {
      let query = msg.text.replace('/start', '').replace(' ', ''), func, param;
      [func, param] = query.split('-');
      if (func === 'key') {
        try {
          let p = await Payment.claimPayment(param, user.id);
          let t:TelegramUser|null = await TelegramUser.findOne({where: {userId: p.userId}});
          if(t) {
            await this.tBot.sendMessage(msg.chat.id, user.__('payment_credit %s %s %s', p.amount, p.currencyCode, t.username ), {parse_mode: 'Markdown'});
            await this.notificationManager.sendNotification(NotificationManager.NOTIF.PAYMENT_DEBIT, {userId: p.userId, currencyCode: p.currencyCode, amount: p.amount, telegramUsername: tUser.username})
          }
        } catch (error) {
          if (error instanceof PaymentError) {
            switch (error.status) {
              case PaymentError.CLAIMED:
                await this.tBot.sendMessage(msg.chat.id, user.__('claim_payment_already_claimed'), {});
                break;
              case PaymentError.EXPIRED:
                await this.tBot.sendMessage(msg.chat.id, user.__('claim_payment_expired'), {});
                break;
              case PaymentError.NOT_FOUND:
                await this.tBot.sendMessage(msg.chat.id, user.__('claim_payment_not_found'), {});
                break;
              case PaymentError.SELF_CLAIM:
                await this.tBot.sendMessage(msg.chat.id, 'TODO: Handle self claim payment link.', {});
                break;
              default:
                await this.tBot.sendMessage(msg.chat.id, 'An error occurred please try again later.', {});
            }
          } else 
            await this.tBot.sendMessage(msg.chat.id, 'An error occurred please try again later.', {});
        }
      } else {
        sendErrorMessage(user, tUser);
      }
    } else {
      await this.tBot.sendMessage(msg.chat.id, '[TODO] HANDLE BOT COMMAND ' + JSON.stringify(msg), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('continue') }]],
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
    }
  }
}