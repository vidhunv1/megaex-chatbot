import * as TelegramBot from 'node-telegram-bot-api';
import TelegramBotApi from './telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Payment, { PaymentError } from '../models/payment'
import CacheStore from '../cache-keys'
import Store from './store'
import Wallet from '../models/wallet';
import Logger from './logger'
import NotificationManager from './notification-manager'
import * as QRCode from 'qrcode'
import * as AppConfig from '../../config/app.json'
let env = process.env.NODE_ENV || 'development';

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

    this.tBot = (new TelegramBotApi()).getBot();;
    TMHandler.instance = this;
  }
  async handleCallbackQuery(msg: TelegramBot.Message, user: User, tUser: TelegramUser, callback: TelegramBot.CallbackQuery) {
    let query: CallbackQuery = callback.data ? this.parseCallbackQuery(callback.data) : this.parseCallbackQuery('');
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    switch (query.callbackFunction) {
      case 'coinSend':
        if (query.coinSend && query.coinSend.coin) {
          await this.tBot.sendMessage(tUser.id, user.__('send_payment_info %s', this.toTitleCase(user.__(query.coinSend.coin))), {
            parse_mode: 'Markdown',
          });
          let coinWallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance'], where: { userId: user.id, currencyCode: query.coinSend.coin } })
          let exchangeRate = 500000;
          if (coinWallet && coinWallet.availableBalance > 0) {
            await this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, this.COINSEND_CONTEXT, cacheKeys.tContext["CoinSend.isInputAmount"], 1);
            await this.tBot.sendMessage(tUser.id, user.__('send_payment_enter_details %s %s %s %s', (coinWallet.availableBalance).toLocaleString(), query.coinSend.coin.toUpperCase(), (coinWallet.availableBalance * exchangeRate).toLocaleString(), 'INR'.toUpperCase()), {
              parse_mode: 'Markdown',
            });
          } else if (coinWallet && coinWallet.availableBalance == 0) {
            await this.tBot.sendMessage(tUser.id, user.__('send_payment_insufficient_balance'), {
              parse_mode: 'Markdown'
            });
          } else {
            this.logger.error("Error in retrieving wallet for " + JSON.stringify(query));
            this.handleError(user, tUser)
          }
        } else {
          this.logger.error("Error in callback query for " + JSON.stringify(query));
          this.handleError(user, tUser);
        }
        break;
      case 'newAddress':
        await this.tBot.sendChatAction(msg.chat.id, 'typing');
        let cCoin, newAddress = null;
        [cCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
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
        if (query.qrCode && query.qrCode.address && query.qrCode.coin) {
          await this.tBot.sendChatAction(msg.chat.id, 'upload_photo');
          let t = await QRCode.toDataURL(query.qrCode.address, { scale: 8 });
          let decodedFile: Buffer = new Buffer(t.split(",")[1], 'base64');
          this.tBot.sendPhoto(tUser.id, decodedFile, { caption: user.__(query.qrCode.coin).toUpperCase() + ' Address' });
        } else {
          this.logger.error("Error with sending qr code: " + JSON.stringify(query));
          this.tBot.sendMessage(tUser.id, user.__('error_unknown'), {
            parse_mode: 'Markdown',
          });
        }
        break;
      case 'coinAddress':
        await this.tBot.sendChatAction(msg.chat.id, 'typing');
        let curCoin;
        [curCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
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
          let nextIndex = +(query.paginate.currentPage) - 1;
          nextIndex++;
          if (nextIndex > (Wallet.getCurrencyCodes().length - 1))
            nextIndex = 0;
          showCoin = Wallet.getCurrencyCodes()[nextIndex];
        } else if (query.paginate && query.paginate.action === 'prev') {
          let prevIndex = +(query.paginate.currentPage) - 1;
          prevIndex--;
          if (prevIndex < 0)
            prevIndex = (Wallet.getCurrencyCodes().length - 1);
          showCoin = Wallet.getCurrencyCodes()[prevIndex];
        } else {
          showCoin = Wallet.getCurrencyCodes()[0];
        }
        await this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], showCoin);
        msg.message_id = query.messageId;
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
      if (this.isBotCommand(msg)) {
        await this.handleBotCommand(msg, user, tUser);
        return;
      }

      if (msg.text && msg.text === user.__('wallet')) {
        this.handleWallet(msg, user, tUser);
      } else if (msg.text && msg.text === user.__('buy_sell')) {
        this.handleBuySell(msg, user, tUser)
      } else if (msg.text && msg.text === user.__('info')) {
        this.handleInfo(msg, user, tUser)
      } else if (msg.text && msg.text === user.__('settings')) {
        this.handleSettings(msg, user, tUser)
      }
      else {
        let currentContext;
        let cacheKeys = (new CacheStore(tUser.id)).getKeys();
        [currentContext] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);
        if (currentContext === this.COINSEND_CONTEXT) {
          this.handleCoinSend(msg, user, tUser);
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
  }

  async handleWallet(msg: TelegramBot.Message | null, user: User, tUser: TelegramUser) {
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    let currentContext, currentCoin, currentPage;
    [currentContext, currentCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, cacheKeys.tContext["Wallet.coin"]);
    if (!currentCoin) {
      currentCoin = Wallet.getCurrencyCodes()[0];
      await this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], currentCoin);
    }

    currentPage = (Wallet.getCurrencyCodes().indexOf(currentCoin) + 1);

    let wallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance', 'unconfirmedBalance', 'blockedBalance'], where: { currencyCode: currentCoin, userId: user.id } })
    let message = '', rate = 600000;
    if (wallet) {
      let availableBalance = wallet.availableBalance;
      let availableBalanceLocal = (wallet.availableBalance * rate).toLocaleString(tUser.languageCode);
      let coinTitle = this.toTitleCase(user.__n(currentCoin, 1));
      let headerPad = ("                                            /"+user.__('help')).slice(-43 + coinTitle.length);
      message = user.__('show_wallet_balance %s %s %s %s %s %s', 
        coinTitle,
        availableBalance,
        currentCoin.toUpperCase(), availableBalanceLocal, '/u' + (user.accountId).toUpperCase(),
        headerPad);
      if (wallet.unconfirmedBalance > 0) {
        let unconfirmedBalance = wallet.unconfirmedBalance;
        let unconfirmedBalanceLocal = (wallet.unconfirmedBalance * rate).toLocaleString(tUser.languageCode);
        message = message + user.__('unconfirmed_balance %s %s %s', unconfirmedBalance, currentCoin.toUpperCase(), unconfirmedBalanceLocal);
      }
      if (wallet.blockedBalance > 0) {
        let blockedBalance = wallet.blockedBalance;
        let blockedBalanceLocal = (wallet.blockedBalance * rate).toLocaleString(tUser.languageCode);
        message = message + user.__('blocked_balance %s %s %s', blockedBalance, currentCoin.toUpperCase(), blockedBalanceLocal);
      }
      message = message + user.__(currentCoin+'_wallet_info')
    } else {
      if (msg)
        this.handleError(user, tUser);
      return;
    }

    let inlineMessageId = (msg && msg.from && msg.from.is_bot) ? msg.message_id : (msg ? msg.message_id + 1 : null);
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

    if (msg && msg.from && msg.from.is_bot) { //callback query
      await this.tBot.editMessageText(message, {
        parse_mode: 'Markdown',
        chat_id: tUser.id, message_id: msg.message_id,
        reply_markup: inlineKeyboard,
        disable_web_page_preview: true
      });
    } else if (msg) {
      await this.tBot.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: inlineKeyboard,
        disable_web_page_preview: true 
      });
    }
    if (!currentContext || currentContext !== this.WALLET_CONTEXT) {
      this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, this.WALLET_CONTEXT);
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

  async handleError(user: User, tUser: TelegramUser) {
    this.tBot.sendMessage(tUser.id, user.__('error_unknown'), {
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
        this.handleError(user, tUser);
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

  async sendCurrentAddress(user: User, tUser: TelegramUser, deleteMessageId: number | null = null) {
    let currentCoin;
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    [currentCoin] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
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

  async handleCoinSend(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
    let cacheKeys = (new CacheStore(tUser.id)).getKeys();
    let coin: string, isInputContext;
    [coin, isInputContext] = await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], cacheKeys.tContext["CoinSend.isInputAmount"]);
    if (msg && msg.text) {
      if (isInputContext) {
        let exchangeRate = 500000;
        let text = msg.text.toLowerCase().replace(/[^0-9a-z.]/g, '');
        let amount = parseFloat(text.replace(/[^0-9.]/g, '')), amountToPay: number = amount;
        let currency = text.replace(/[^a-z]/g, '');

        if (Wallet.getCurrencyCodes().indexOf(currency) >= 0) {
          coin = currency;
        }

        if (currency === 'inr') {
          amountToPay = amount / exchangeRate;
        }

        let wallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance'], where: { currencyCode: coin, userId: user.id } });
        if (wallet && wallet.availableBalance) {
          if (amountToPay <= wallet.availableBalance && amountToPay > 0) {
            await this.redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"], amountToPay);
            await this.tBot.sendMessage(tUser.id, user.__('send_payment_create_confirm %s %s', amountToPay, coin.toUpperCase()), {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: [[{ text: user.__('create') }], [{ text: user.__('cancel') }]],
                one_time_keyboard: true
              }
            });
          } else {
            let message;
            if (!isNaN(amountToPay))
              message = 'You have insufficient balance to make this payment.';
            else
              message = 'Invalid input specified. Please try again.';
            await this.tBot.sendMessage(tUser.id, message, {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: this.keyboardMenu(user),
                one_time_keyboard: false
              }
            });
            await this.redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);
          }
        }
        await this.redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.isInputAmount"])
      } else {
        let amount: number;
        await this.redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);
        await this.redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.isInputAmount"])
        amount = parseFloat(await this.redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"]));
        if (msg.text === user.__('create')) {
          try {
            let { paymentCode } = await Payment.newPayment(user.id, coin, amount);
            if (!isNaN(amount) && amount > 0) {
              await this.tBot.sendMessage(tUser.id, user.__('send_payment_created'), {
                parse_mode: 'Markdown',
                reply_markup: {
                  keyboard: this.keyboardMenu(user),
                  one_time_keyboard: false
                }
              });
              let botUsername = (<any>AppConfig)[env]["telegram_bot_username"];
              await this.tBot.sendMessage(tUser.id, 'https://t.me/' + botUsername + '?start=key-' + paymentCode, {
                reply_markup: {
                  keyboard: this.keyboardMenu(user),
                  one_time_keyboard: false
                }
              });
            } else {
              this.logger.error("Error in retrieving amount for sendPayment: " + amount);
              await this.handleError(user, tUser);
            }
          } catch (error) {
            this.logger.error("New Payment error occured");
            await this.handleError(user, tUser);
          }
        } else if (msg.text === user.__('cancel')) {
          await this.tBot.sendMessage(tUser.id, user.__('send_payment_cancelled'), {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: this.keyboardMenu(user),
              one_time_keyboard: false
            }
          });
        } else {
          await this.tBot.sendMessage(tUser.id, user.__('send_payment_unknown_req'), {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: this.keyboardMenu(user),
              one_time_keyboard: false
            }
          });
        }
      }
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