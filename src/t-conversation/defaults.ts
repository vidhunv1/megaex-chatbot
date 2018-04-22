import User from '../models/user'
import TelegramUser from '../models/telegram_user'
import TelegramBotApi from '../helpers/telegram-bot-api'
import * as TelegramBot from 'node-telegram-bot-api';

let tBot = (new TelegramBotApi()).getBot();
let keyboardMenu = (user: User) => {
  return [
    [{ text: user.__('wallet') }, { text: user.__('buy_sell') }],
    [{ text: user.__('my_account') }, { text: user.__('settings') }]
  ]
}

let sendErrorMessage = async function (user: User, tUser: TelegramUser) {
  tBot.sendMessage(tUser.id, user.__('error_unknown'), {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
}

let toTitleCase = function (s: string) {
  return s.replace(/\b\w/g, l => l.toUpperCase());
}

let stringifyCallbackQuery = function (callbackFunction: CallbackQuery["callbackFunction"], messageId: number | null, values: null | CallbackQuery["coinSend"] | CallbackQuery["coinAddress"] | CallbackQuery["coinWithdraw"] | CallbackQuery["paginate"] | CallbackQuery["back"] | CallbackQuery["qrCode"] | CallbackQuery["openOrders"] | CallbackQuery["sendMessage"] | CallbackQuery["blockAccount"] | CallbackQuery["addPayment"] | CallbackQuery["deletePayment"]| CallbackQuery["editPayment"] | CallbackQuery["showPayments"]) {
  let q = callbackFunction + ':';
  if (messageId)
    q = q + 'messageId=' + messageId + ',';
  let t: any = values ? values : {};
  Object.keys(t).forEach(function (key) {
    q = q + key + '=' + t[key] + ','
  });
  return q.substring(0, q.length - 1);
}

let parseCallbackQuery = function (query: string): CallbackQuery {
  let callbackFunction, obj, pairs: string[], tKey, tVal;
  [callbackFunction, obj] = query.split(':');
  let res: any = { callbackFunction };
  res[callbackFunction] = {};
  pairs = obj ? obj.split(',') : [];
  for (let i = 0; i < pairs.length; i++) {
    if (pairs.length > 0) {
      [tKey, tVal] = pairs[i].split('=');
      if (tKey === 'messageId')
        res[tKey] = tVal;
      else
        res[callbackFunction][tKey] = tVal;
    }
  }
  console.log("RES: "+JSON.stringify(res));
  return res;
}

let isBotCommand = function (msg: TelegramBot.Message) {
  return (msg.text && msg.entities && msg.entities[0].type === 'bot_command')
}

let centerJustify = function (str: string|number, length: number) {
  let char = ' ';
  str = str + '';
  return char.repeat((length - str.length) / 2) + str + char.repeat((length - str.length) / 2);
}

export { keyboardMenu, sendErrorMessage, toTitleCase, stringifyCallbackQuery, parseCallbackQuery, isBotCommand, centerJustify };