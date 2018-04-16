import * as TelegramBot from 'node-telegram-bot-api';
import CacheStore from '../cache-keys'
import Wallet from '../models/wallet';
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import * as QRCode from 'qrcode'
import Store from '../helpers/store'
import TelegramBotApi from '../helpers/telegram-bot-api'
import Logger from '../helpers/logger'
import Payment from '../models/payment'
import * as AppConfig from '../../config/app.json'
import { keyboardMenu, sendErrorMessage, toTitleCase, stringifyCallbackQuery } from './defaults';

let env = process.env.NODE_ENV || 'development';

let WALLET_CONTEXT = 'Wallet';
let COINSEND_CONTEXT = 'CoinSend';

let logger = (new Logger()).getLogger()
let redisClient = (new Store()).getClient();
let tBot = (new TelegramBotApi()).getBot();
let walletConversation = async function(msg: TelegramBot.Message | null, user: User, tUser: TelegramUser):Promise<boolean> {
  if(!(msg && msg.text === user.__('wallet'))) {
    return false;
  }
 
  handleWallet(msg, user, tUser);
  return true;
}

let walletCallback = async function(msg: TelegramBot.Message, user: User, tUser: TelegramUser, query:CallbackQuery):Promise<boolean> {
  console.log("Handling callback query: "+query.callbackFunction);
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  switch (query.callbackFunction) {
    case 'coinSend':
      if (query.coinSend && query.coinSend.coin) {
        await tBot.sendMessage(tUser.id, user.__('send_payment_info %s', toTitleCase(user.__(query.coinSend.coin))), {
          parse_mode: 'Markdown',
        });
        let coinWallet: Wallet | null = await Wallet.findOne({ attributes: ['availableBalance'], where: { userId: user.id, currencyCode: query.coinSend.coin } })
        let exchangeRate = 500000;
        if (coinWallet && coinWallet.availableBalance > 0) {
          await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, COINSEND_CONTEXT, cacheKeys.tContext["CoinSend.isInputAmount"], 1);
          await tBot.sendMessage(tUser.id, user.__('send_payment_enter_details %s %s %s %s', (coinWallet.availableBalance).toLocaleString(), query.coinSend.coin.toUpperCase(), (coinWallet.availableBalance * exchangeRate).toLocaleString(), 'INR'.toUpperCase()), {
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
      console.log("inside CASE: "+JSON.stringify(query));
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
  if(context === COINSEND_CONTEXT) {
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
    await tBot.sendMessage(tUser.id, '*' + wallet.address + '*', {
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
          await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"], amountToPay);
          await tBot.sendMessage(tUser.id, user.__('send_payment_create_confirm %s %s', amountToPay, coin.toUpperCase()), {
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
          await tBot.sendMessage(tUser.id, message, {
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
      await redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext);
      await redisClient.hdelAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.isInputAmount"])
      amount = parseFloat(await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["CoinSend.amount"]));
      if (msg.text === user.__('create')) {
        try {
          let { paymentCode } = await Payment.newPayment(user.id, coin, amount);
          if (!isNaN(amount) && amount > 0) {
            await tBot.sendMessage(tUser.id, user.__('send_payment_created'), {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false
              }
            });
            let botUsername = (<any>AppConfig)[env]["telegram_bot_username"];
            await tBot.sendMessage(tUser.id, 'https://t.me/' + botUsername + '?start=key-' + paymentCode, {
              reply_markup: {
                keyboard: keyboardMenu(user),
                one_time_keyboard: false
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
    let availableBalance = wallet.availableBalance;
    let availableBalanceLocal = (wallet.availableBalance * rate).toLocaleString(tUser.languageCode);
    let coinTitle = toTitleCase(user.__n(currentCoin, 1));
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
      sendErrorMessage(user, tUser);
    return true;
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
        { text: toTitleCase(user.__('prev')), callback_data: stringifyCallbackQuery('paginate', inlineMessageId, { action: 'prev', currentPage }) },
        { text: user.__('pagination %s %d %d', currentCoin.toUpperCase(), currentPage, Wallet.getCurrencyCodes().length), callback_data: stringifyCallbackQuery('paginate', inlineMessageId, { action: 'refresh', currentPage }) },
        { text: toTitleCase(user.__('next')), callback_data: stringifyCallbackQuery('paginate', (inlineMessageId), { action: 'next', currentPage }) }]
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
  if (!currentContext || currentContext !== WALLET_CONTEXT) {
    redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, WALLET_CONTEXT);
  }
}

export {walletConversation, walletCallback, walletContext};