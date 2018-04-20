import * as TelegramBot from 'node-telegram-bot-api';
import TelegramUser from '../models/telegram_user'
import Store from '../helpers/store'
import CacheStore from '../cache-keys'
import User from '../models/user'
import TelegramBotApi from '../helpers/telegram-bot-api'
import * as moment from 'moment'

import { stringifyCallbackQuery, keyboardMenu, sendErrorMessage } from './defaults';
import * as AppConfig from '../../config/app.json'
let env = process.env.NODE_ENV || 'development';

let CONTEXT_SENDMESSAGE = "CONTEXT_SENDMESSAGE";

let redisClient = (new Store()).getClient();
let tBot = (new TelegramBotApi()).getBot();
let accountConversation = async function (msg: TelegramBot.Message, user: User, tUser: TelegramUser): Promise<boolean> {
  if (msg.text && msg.text.startsWith('/u') && msg.entities) {
    let accountId = msg.text.substring(msg.entities[0].offset + 2, msg.entities[0].length).toLowerCase();
    showAccount(accountId, msg, user, tUser);
    return true;
  } else if (msg.text && msg.text === user.__('my_account')) {
    console.log("SHOWING ACCOUNT");
    showMyAccount(msg, user, tUser);
    return true;
  } else if (msg.text && msg.text.startsWith('/start')) {
    let query = msg.text.replace('/start', '').replace(' ', ''), func, param;
    [func, param] = query.split('-');
    if (func === 'ref') { //handle referrals
      handleReferrals(msg, user, tUser);
      return true;
    } else if (func === 'acc') { //handle account
      showAccount(param, msg, user, tUser);
      return true;
    } else {
      return false;
    }
  } else {
    return false;
  }
}

let accountCallback = async function (msg: TelegramBot.Message, user: User, tUser: TelegramUser, query: CallbackQuery): Promise<boolean> {
  let botUsername = (<any>AppConfig)[env]["telegram_bot_username"];
  switch (query.callbackFunction) {
    case 'accountLink':
      await tBot.sendMessage(msg.chat.id, user.__('show_account_link_info'), {
        parse_mode: 'Markdown',
      });
      await tBot.sendMessage(tUser.id, 'https://t.me/' + botUsername + '?start=acc-' + user.accountId.toLowerCase(), {});
      return true;
    case 'referralLink':
      await tBot.sendMessage(msg.chat.id, user.__('show_referral_link_info'), {
        parse_mode: 'Markdown',
      });
      await tBot.sendMessage(tUser.id, 'https://t.me/' + botUsername + '?start=ref-' + user.accountId.toLowerCase(), {
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      });
      return true;
    case 'addPayment':
      await tBot.sendMessage(tUser.id, '[TODO] Handle add payment', {});
      return true;
    case 'openOrders':
      await tBot.sendMessage(tUser.id, '[TODO] Handle open orders', {});
      return true;
    case 'sendMessage':
      if (!query || !query.sendMessage || !query.sendMessage.accountId)
        return true;
      let cacheKeys = (new CacheStore(tUser.id)).getKeys();
      await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, CONTEXT_SENDMESSAGE, cacheKeys.tContext["SendMessage.accountId"], query.sendMessage.accountId, 'EX', 240);
      let receiverUser: User | null = await User.findOne({ where: { accountId: query.sendMessage.accountId } });
      let receiverBlockedUsers: number[] = receiverUser ? JSON.parse(receiverUser.blockedUsers) : [];
      let amIBlocked: boolean = (receiverUser != null && (receiverBlockedUsers.indexOf(user.id) > -1));
      if (amIBlocked) {
        tBot.sendMessage(tUser.id, user.__('send_message_not_allowed'), { parse_mode: 'Markdown' });
      } else if (receiverUser) {
        let myBlockList: number[] = JSON.parse(user.blockedUsers);
        if (myBlockList.indexOf(receiverUser.id) > -1) {
          tBot.sendMessage(tUser.id, user.__('send_error_user_blocked'), { parse_mode: 'Markdown' });
        } else {
          tBot.sendMessage(tUser.id, user.__('enter_send_message'), { parse_mode: 'Markdown' });
        }
      } else {
        sendErrorMessage(user, tUser);
      }
      return true;
    case 'blockAccount':
      if (!query || !query.blockAccount || !query.blockAccount.accountId)
        return true;
      let blockedUsers1: number[] = JSON.parse(user.blockedUsers);
      console.log("BLOCK: " + query.blockAccount.shouldBlock + ", " + JSON.stringify(blockedUsers1) + ' ' + typeof (query.blockAccount.shouldBlock));
      let b: User | null = await User.findOne({ where: { accountId: query.blockAccount.accountId } });
      if (b) {
        console.log(">>>> " + JSON.stringify(b) + ', ' + (!query.blockAccount.shouldBlock) + ', ' + (blockedUsers1.indexOf(b.id) > -1));
        if (query.blockAccount.shouldBlock == 0 && blockedUsers1) {
          //to unblock
          console.log("unblocking...");
          blockedUsers1.splice(blockedUsers1.indexOf(b.id), 1);
        } else if (query.blockAccount.shouldBlock && blockedUsers1.indexOf(b.id) <= -1) {
          //to block
          console.log("blocking...");
          blockedUsers1.push(b.id);
        }
      } else {
        sendErrorMessage(user, tUser);
      }
      console.log("USER TO UPDATE: " + JSON.stringify(user));
      await User.update({ blockedUsers: JSON.stringify(blockedUsers1) }, { where: { id: user.id } });
      await (new CacheStore(tUser.id)).clearUserCache();
      msg.message_id = query.messageId;
      user.blockedUsers = JSON.stringify(blockedUsers1);
      showAccount(query.blockAccount.accountId, msg, user, tUser);
      return true;
    default:
      return false;
  }
}

let accountContext = async function (msg: TelegramBot.Message, user: User, tUser: TelegramUser, context: string): Promise<boolean> {
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  let [sendAccount] = await redisClient.hmgetAsync(cacheKeys.tContext.key, cacheKeys.tContext["SendMessage.accountId"]);
  await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, '', cacheKeys.tContext["SendMessage.accountId"], '');
  if (context === CONTEXT_SENDMESSAGE) {
    let sendUser: User | null = await User.findOne({ where: { accountId: sendAccount.toLowerCase() }, include: [TelegramUser] });
    if (sendUser && (msg.text || msg.photo)) {
      let replyMarkup = {
        inline_keyboard: [[{ text: user.__('send_response_message'), callback_data: stringifyCallbackQuery('sendMessage', null, { accountId: user.accountId }) }]]
      }
      if (msg.text) {
        await tBot.sendMessage(sendUser.telegramUser.id, user.__('new_message %s', '/u' + user.accountId.toUpperCase()) + '\n\n' + msg.text, {
          parse_mode: 'Markdown',
          reply_markup: replyMarkup
        });
      } else if (msg.photo) {
        await tBot.sendMessage(sendUser.telegramUser.id, user.__('new_message %s', '/u' + user.accountId.toUpperCase()), {
          parse_mode: 'Markdown'
        });
        await tBot.sendPhoto(sendUser.telegramUser.id, msg.photo[0].file_id, {
          reply_markup: replyMarkup
        });
      }
      await tBot.sendMessage(tUser.id, user.__('message_send_success %s', '/u' + sendUser.accountId.toUpperCase()), {});
    } else {
      await tBot.sendMessage(tUser.id, user.__('message_send_failed'), {});
    }
    return true;
  }
  return false;
}

async function showMyAccount(msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
  let addPaymentInline = { text: user.__('add_payment_method'), callback_data: stringifyCallbackQuery('addPayment', null, null) };
  let fisrtInline = !user.isVerified ? [{ text: user.__('verify_account'), url: 'http://google.com' }, addPaymentInline] : [addPaymentInline];
  let verificationMessage = user.isVerified ? user.__('account_verified') : user.__('account_not_verified');
  await tBot.sendMessage(msg.chat.id, user.__('show_my_account %s %d %f %f %d %d %d %d %d %s', '/u' + (user.accountId.toUpperCase()), 1, 0.0001, 4.8, 4, 1, 2, 100, 1, verificationMessage, 'PayTM, UPI, IMPS'), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [fisrtInline, [{ text: user.__('referral_link'), callback_data: stringifyCallbackQuery('referralLink', null, null) }, { text: user.__('account_link'), callback_data: stringifyCallbackQuery('accountLink', null, null) }]],
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
}

async function showAccount(accountId: string, msg: TelegramBot.Message, user: User, tUser: TelegramUser) {
  console.log("ACCOUNT: " + accountId + ", " + JSON.stringify(msg) + ", " + JSON.stringify(user));
  if (!msg.text || !msg.entities)
    return;
  let cacheKeys = (new CacheStore(tUser.id)).getKeys();
  await redisClient.hmsetAsync(cacheKeys.tContext.key, cacheKeys.tContext.currentContext, '');
  let showUser: User | null = await User.findOne({ where: { accountId: accountId } });
  if (showUser) {
    let blockedUsers: number[] = JSON.parse(user.blockedUsers);
    let isUserBlocked = (blockedUsers.indexOf(showUser.id) > -1);
    let blockUnblockMessage = isUserBlocked ? user.__('unblock_account') : user.__('block_account');
    console.log("BLOCK MESSAGE: " + blockUnblockMessage + ", " + JSON.stringify(blockedUsers));
    let inlineMessageId = (msg && msg.from && msg.from.is_bot) ? msg.message_id : (msg ? msg.message_id + 1 : null);
    let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          { text: blockUnblockMessage, callback_data: stringifyCallbackQuery('blockAccount', inlineMessageId, { accountId: accountId, shouldBlock: isUserBlocked ? 0 : 1 }) },
          { text: user.__('send_message'), callback_data: stringifyCallbackQuery('sendMessage', null, { accountId: accountId }) },
        ],
        [
          { text: user.__('open_orders %d', 1), callback_data: stringifyCallbackQuery('openOrders', null, { accountId: accountId }) }
        ]
      ]
    }

    let verificationMessage = showUser.isVerified ? showUser.__('account_verified') : showUser.__('account_not_verified');
    let lastActive = moment().diff(showUser.updatedAt, 'm');
    let message: string = user.__('show_other_account %s %d %f %f %d %d %s %d %s %d', '/u' + (accountId.toUpperCase()), 1, 0.0001, 4.8, 4, 1, verificationMessage, '10', 'PayTM, UPI, IMPS', lastActive)
    if (isUserBlocked)
      message = message + user.__('account_block_info');
    if(accountId.toLowerCase() === user.accountId) {
      message = message + user.__('my_account_info');
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
        reply_markup: inlineKeyboard
      });
    }
  } else { //account not found
    await tBot.sendMessage(msg.chat.id, user.__('account_not_available %s', accountId.toUpperCase()), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: keyboardMenu(user),
        one_time_keyboard: false,
        resize_keyboard: true
      }
    });
  }
}

async function handleReferrals(msg: TelegramBot.Message, user: User, _tUser: TelegramUser) {
  await tBot.sendMessage(msg.chat.id, '[TODO] HANDLE REFERRALS ', {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
}

export {accountConversation, accountCallback, accountContext};