import * as TelegramBot from 'node-telegram-bot-api';
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import Market from '../models/market'; 
import TelegramBotApi from '../helpers/telegram-bot-api'
import { stringifyCallbackQuery } from './defaults';

let tBot = (new TelegramBotApi()).getBot();
let tradeConversation = async function(msg: TelegramBot.Message | null, user: User, tUser: TelegramUser):Promise<boolean> {
  if(!(msg && msg.text === user.__('buy_sell'))) {
    return false;
  }
  let rate = (await Market.getValue('btc', user.currencyCode))
  let localizedRate = 'N/A';
  if(rate)
    localizedRate = rate.toLocaleString(tUser.languageCode, {style: 'currency', currency: user.currencyCode});
  tBot.sendMessage(msg.chat.id, user.__('buy_sell_message %s %s', user.currencyCode.toUpperCase(), localizedRate), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [{text: user.__('buy_button'), callback_data: stringifyCallbackQuery('buy', null, null)}, {text: user.__('sell_button'), callback_data: stringifyCallbackQuery('sell', null, null)}],
        [{text: user.__('open_orders %d', 0), callback_data: stringifyCallbackQuery('openOrders', null, null)}]
      ]
    }
  });
  return true
}

let tradeCallback = async function(_msg: TelegramBot.Message, _user: User, _tUser: TelegramUser, _query:CallbackQuery):Promise<boolean> {
  return false;
}

let tradeContext = async function(_msg:TelegramBot.Message, _user: User, _tUser: TelegramUser, _context:string):Promise<boolean> {
  return false;
}

export {tradeConversation, tradeCallback, tradeContext};