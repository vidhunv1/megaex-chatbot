import * as TelegramBot from 'node-telegram-bot-api';
import CacheStore from '../cache-keys'
import Wallet from '../models/wallet';
import TelegramUser from '../models/telegram_user'
import * as moment from 'moment'
import Transfer, { TransferError } from '../models/transfer'
import User from '../models/user'
import Market from '../models/market'
import * as QRCode from 'qrcode'
import Store from '../helpers/store'
import TelegramBotApi from '../helpers/telegram-bot-api'
import Logger from '../helpers/logger'
import NotificationManager from '../helpers/notification-manager'
import * as AppConfig from '../../config/app.json'

import { keyboardMenu, sendErrorMessage, toTitleCase, stringifyCallbackQuery, centerJustify } from './defaults';
import Transaction from '../models/transaction';

let env = process.env.NODE_ENV || 'development';

let CONTEXT_WALLET = 'Wallet';
let CONTEXT_COINSEND = 'CoinSend';

let logger = (new Logger()).getLogger()
let redisClient = (new Store()).getClient();
let tBot = (new TelegramBotApi()).getBot();
let notificationManager:NotificationManager = new NotificationManager();

let walletConversation = async function(msg: TelegramBot.Message, user: User, tUser: TelegramUser):Promise<boolean> {
  if(msg.text === user.__('wallet')) {
    handleWallet(msg, user, tUser);
    return true;
  } else if (msg.text && msg.text.startsWith('/start')) {
    let query = msg.text.replace('/start', '').replace(' ', ''), func, param;
    [func, param] = query.split('-');
    if (func === 'key') { //handle payment
      handlePaymentClaim(msg, user, tUser, param);
      return true;
    } else {
      return false;
    }
  } else if(msg.text && msg.text === '/tx') {
    let message = user.__('tx_header'), footer = '';
    for(let i=0;i<Wallet.getCurrencyCodes().length; i++) {
      let t = await Wallet.findOne({where: {userId: user.id, currencyCode: Wallet.getCurrencyCodes()[i]}})
      if(t)
        footer = footer + user.__('tx_coin_balance %s %f', t.currencyCode.toUpperCase(), (t.availableBalance + t.blockedBalance + t.unconfirmedBalance), 7);
    }

    let txs = await Transaction.findAll({where: {userId: user.id}, limit: 25});
    for(let i=0; i<txs.length; i++) {
      let type;
      if(txs[i].transactionType === 'receive')
        type = user.__('credit');
      else
        type = user.__('Debit');
      message = message + user.__('tx_item %s %s %s', centerJustify(txs[i].currencyCode.toUpperCase(), 9), centerJustify(txs[i].amount, 9), centerJustify(type, 9));
    }
    message = message + footer;
    await tBot.sendMessage(msg.chat.id, message, {
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

let walletCallback = async function(msg: TelegramBot.Message, user: User, tUser: TelegramUser, query:CallbackQuery):Promise<boolean> {
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  switch (query.callbackFunction) {
    case 'coinSend':
      if (query.coinSend && query.coinSend.coin) {
        await tBot.sendMessage(tUser.id, user.__('send_payment_info %s', toTitleCase(user.__(query.coinSend.coin))), {
          parse_mode: 'Markdown',
        });
        let coinWallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance'], where: { userId: user.id, currencyCode: query.coinSend.coin } })
        if (coinWallet && coinWallet.availableBalance > 0) {
          await redisClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry);
          await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, CONTEXT_COINSEND, cacheKeys.tContext["CoinSend.isInputAmount"], 1, cacheKeys.tContext["Wallet.coin"], query.coinSend.coin);
          let value = (await Market.getValue(query.coinSend.coin, user.currencyCode)) || 100;
          await tBot.sendMessage(tUser.id, user.__('send_payment_enter_details %s %s %s %s', (coinWallet.availableBalance).toLocaleString(), query.coinSend.coin.toUpperCase(), (coinWallet.availableBalance * value).toLocaleString(), user.currencyCode.toUpperCase()), {
            parse_mode: 'Markdown',
          });
        } else if (coinWallet && coinWallet.availableBalance == 0) {
          await tBot.sendMessage(tUser.id, user.__('send_payment_insufficient_balance'), {
            parse_mode: 'Markdown'
          });
        } else {
          logger.error("Error in retrieving wallet for " + JSON.stringify(query));
          sendErrorMessage(user, tUser)
        }
      } else {
        logger.error("Error in callback query for " + JSON.stringify(query));
        sendErrorMessage(user, tUser);
      }
      return true;
    case 'newAddress':
      await tBot.sendChatAction(msg.chat.id, 'typing');
      let cCoin, newAddress = null;
      [cCoin] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
      if (cCoin) {
        let wallet = await Wallet.findOne({ where: { currencyCode: cCoin, userId: user.id } });
        if (wallet) {
          newAddress = await wallet.newAddress();
        }
      }
      if (newAddress) {
        await tBot.sendMessage(tUser.id, user.__('new_address_generated %s', toTitleCase(user.__n(cCoin, 1))), {
          parse_mode: 'Markdown',
        });
        sendCurrentAddress(user, tUser, null);
      } else {
        tBot.sendMessage(tUser.id, user.__('error_new_address'), {
          parse_mode: 'Markdown',
        });
      }
      return true;
    case 'qrCode':
      if (query.qrCode && query.qrCode.address && query.qrCode.coin) {
        await tBot.sendChatAction(msg.chat.id, 'upload_photo');
        let t = await QRCode.toDataURL(query.qrCode.address, { scale: 8 });
        let decodedFile: Buffer = new Buffer(t.split(",")[1], 'base64');
        tBot.sendPhoto(tUser.id, decodedFile, { caption: user.__(query.qrCode.coin).toUpperCase() + ' Address' });
      } else {
        logger.error("Error with sending qr code: " + JSON.stringify(query));
        tBot.sendMessage(tUser.id, user.__('error_unknown'), {
          parse_mode: 'Markdown',
        });
      }
      return true;
    case 'coinAddress':
      await tBot.sendChatAction(msg.chat.id, 'typing');
      let curCoin;
      [curCoin] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
      await tBot.sendMessage(tUser.id, user.__('show_address_header %s', toTitleCase(user.__n(curCoin, 1))), {
        parse_mode: 'Markdown',
      });
      sendCurrentAddress(user, tUser, null);
      return true;
    case 'coinWithdraw':
      tBot.sendMessage(tUser.id, '[TODO] Handle coin withdraw', {
        parse_mode: 'Markdown',
      });
      return true;
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
      await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], showCoin);
      msg.message_id = query.messageId;
      handleWallet(msg, user, tUser);
      return true;
    default:
      return false;
  }
}

let walletContext = async function(msg:TelegramBot.Message, user: User, tUser: TelegramUser, context:string):Promise<boolean> {
  if(context === CONTEXT_COINSEND) {
    handleCoinSend(msg, user, tUser);
    return true;
  } else {
    return false;
  }
}

async function sendCurrentAddress(user: User, tUser: TelegramUser, deleteMessageId: number | null = null) {
  let currentCoin;
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  [currentCoin] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"]);
  let wallet: Wallet | null = await Wallet.findOne({ attributes: ['address', 'currencyCode'], where: { currencyCode: currentCoin, userId: user.id } })

  if (wallet) {
    let walletAddress = wallet.address ? wallet.address : 'Your address is being generated, please check back later';
    logger.error("No address is available");

    await tBot.sendMessage(tUser.id, '*' + walletAddress + '*', {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: user.__('new_address'), callback_data: stringifyCallbackQuery('newAddress', deleteMessageId, { coin: currentCoin }) },
            { text: user.__('qr_code'), callback_data: stringifyCallbackQuery('qrCode', null, { coin: currentCoin, address: wallet.address }) }],
          [{ text: user.__('address_info'), url: 'https://google.com' }]
        ]
      }
    });
  } else {
    logger.error("No wallet address available: " + currentCoin);
    tBot.sendMessage(tUser.id, 'An error occured, please try again later', {
      parse_mode: 'Markdown',
    });
  }
}

async function handleCoinSend(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  let coin: string, isInputContext;
  [coin, isInputContext] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], cacheKeys.tContext["CoinSend.isInputAmount"]);
  if (msg && msg.text) {
    if (isInputContext) {
      let amountToPay:number|null = await Market.parseCurrencyValue(msg.text, coin);
      if(!amountToPay) {
        await tBot.sendMessage(tUser.id, user.__('invalid_input'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false
          }
        });
        return;
      }

      let wallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance'], where: { currencyCode: coin, userId: user.id } });
      if (wallet && wallet.availableBalance) {
        if (amountToPay <= wallet.availableBalance && amountToPay > 0) {
          await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"], amountToPay);
          redisClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry);
          await tBot.sendMessage(tUser.id, user.__('send_payment_create_confirm %f %s', amountToPay, coin.toUpperCase()), {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [[{ text: user.__('create') }], [{ text: user.__('cancel') }]],
              one_time_keyboard: true,
              resize_keyboard: true
            }
          });
        } else {
          await tBot.sendMessage(tUser.id, user.__('send_payment_insufficient_balance'), {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: keyboardMenu(user),
              one_time_keyboard: false
            }
          });
          await redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);
        }
      }
      await redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.isInputAmount"])
    } else {
      let amount: number;
      amount = parseFloat(await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"]));
      await redisClient.delAsync(cacheKeys.tContext.key);
      if (msg.text === user.__('create')) {
        try {
          let { paymentCode } = await Transfer.newPayment(user.id, coin, amount);
          if (!isNaN(amount) && amount > 0) {
            await tBot.sendMessage(tUser.id, user.__('send_payment_created %d', ((<any>AppConfig)[env]["payment_expiry"]/60)), {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false,
                resize_keyboard: true
              }
            });
            let botUsername = (<any>AppConfig)[env]["telegram_bot_username"];
            await tBot.sendMessage(tUser.id, 'https://t.me/' + botUsername + '?start=key-' + paymentCode, {
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false,
                resize_keyboard: true
              }
            });
          } else {
            logger.error("Error in retrieving amount for sendPayment: " + amount);
            await sendErrorMessage(user, tUser);
          }
        } catch (error) {
          logger.error("New Payment error occured");
          await sendErrorMessage(user, tUser);
        }
      } else if (msg.text === user.__('cancel')) {
        await tBot.sendMessage(tUser.id, user.__('send_payment_cancelled'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false
          }
        });
      } else {
        await tBot.sendMessage(tUser.id, user.__('send_payment_unknown_req'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false
          }
        });
      }
    }
  }
}

async function handlePaymentClaim(msg: TelegramBot.Message, user: User, tUser: TelegramUser, paymentSecret: string) {
  if(!msg.text) return;
  try {
    let p = await Transfer.claimPayment(paymentSecret, user.id);
    let t:TelegramUser|null = await TelegramUser.findOne({where: {userId: p.userId}});
    if(t) {
      tBot.sendMessage(msg.chat.id, user.__('payment_credit %s %s %s', p.amount, p.currencyCode, t.username ? '@'+t.username : '*'+t.firstName+' '+t.lastName+'*' ), {parse_mode: 'Markdown'});
      await notificationManager.sendNotification(NotificationManager.NOTIF.PAYMENT_DEBIT, {userId: p.userId, currencyCode: p.currencyCode, amount: p.amount, telegramUsername: tUser.username, telegramName: '*'+tUser.firstName + ' '+ t.lastName+'*'})
    }
  } catch (error) {
    if (error instanceof TransferError) {
      switch (error.status) {
        case TransferError.CLAIMED:
          await tBot.sendMessage(msg.chat.id, user.__('claim_payment_already_claimed'), {});
          break;
        case TransferError.EXPIRED:
          await tBot.sendMessage(msg.chat.id, user.__('claim_payment_expired'), {});
          break;
        case TransferError.NOT_FOUND:
          await tBot.sendMessage(msg.chat.id, user.__('claim_payment_not_found'), {});
          break;
        case TransferError.SELF_CLAIM:
          let p:Transfer|null = await Transfer.getBySecret(paymentSecret);
          if(!p) return;
          await tBot.sendMessage(msg.chat.id, user.__('send_payment_info %f %s %d', p.amount, p.currencyCode, (((<any>AppConfig)[env]["payment_expiry"]/60) - moment(moment()).diff(p.createdAt, 'm'))), {});
          break;
        default:
          await tBot.sendMessage(msg.chat.id, 'An error occurred please try again later.', {});
      }
    } else 
      await tBot.sendMessage(msg.chat.id, 'An error occurred please try again later.', {});
  }
}

async function handleWallet(msg: TelegramBot.Message | null, user: User, tUser: TelegramUser) {
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  let currentContext, currentCoin, currentPage;
  [currentContext, currentCoin] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, cacheKeys.tContext["Wallet.coin"]);
  if (!currentCoin) {
    currentCoin = Wallet.getCurrencyCodes()[0];
    await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["Wallet.coin"], currentCoin);
  }

  currentPage = (Wallet.getCurrencyCodes().indexOf(currentCoin) + 1);

  let wallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance', 'unconfirmedBalance', 'blockedBalance'], where: { currencyCode: currentCoin, userId: user.id } })
  let message = '', rate = 600000;
  if (wallet) {
    let availableBalance = wallet.availableBalance, availableBalanceLocal:string;
    let val = await Market.getValue(currentCoin, user.currencyCode);
    availableBalanceLocal = val ? (val*wallet.availableBalance).toLocaleString(tUser.languageCode, {style: 'currency', currency: user.currencyCode}) : 'N/A';
    let coinTitle = toTitleCase(user.__n(currentCoin, 1));
    let headerPad = ("                                            /"+user.__('help')).slice(-43 + coinTitle.length);
    message = user.__('show_wallet_balance %s %s %s %s %s', 
      coinTitle,
      availableBalance,
      currentCoin.toUpperCase(), 
      availableBalanceLocal,
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
    message = message + user.__('my_transactions')
    message = message + user.__(currentCoin+'_wallet_info')
  } else {
    if (msg)
      sendErrorMessage(user, tUser);
    return;
  }

  let inlineMessageId = (msg && msg.from && msg.from.is_bot) ? msg.message_id : (msg ? msg.message_id + 1 : null);
  let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: [
      [{ text: user.__('send %s', toTitleCase(user.__n(currentCoin, 1))), callback_data: stringifyCallbackQuery('coinSend', inlineMessageId, { coin: currentCoin }) }],
      [
        { text: user.__('my_address'), callback_data: stringifyCallbackQuery('coinAddress', inlineMessageId, { coin: currentCoin }) },
        { text: user.__('withdraw'), callback_data: stringifyCallbackQuery('coinWithdraw', inlineMessageId, { coin: currentCoin }) }
      ],
      [
        { text: user.__('prev'), callback_data: stringifyCallbackQuery('paginate', inlineMessageId, { action: 'prev', currentPage }) },
        { text: user.__('pagination %s %d %d', currentCoin.toUpperCase(), currentPage, Wallet.getCurrencyCodes().length), callback_data: stringifyCallbackQuery('paginate', inlineMessageId, { action: 'refresh', currentPage }) },
        { text: user.__('next'), callback_data: stringifyCallbackQuery('paginate', (inlineMessageId), { action: 'next', currentPage }) }]
    ]
  }

  if (msg && msg.from && msg.from.is_bot) { //callback query
    await tBot.editMessageText(message, {
      parse_mode: 'Markdown',
      chat_id: tUser.id, message_id: msg.message_id,
      reply_markup: inlineKeyboard,
      disable_web_page_preview: true
    });
  } else if (msg) {
    await tBot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard,
      disable_web_page_preview: true 
    });
  }
  if (!currentContext || currentContext !== CONTEXT_WALLET) {
    redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, CONTEXT_WALLET);
  }
}

export {walletConversation, walletCallback, walletContext};