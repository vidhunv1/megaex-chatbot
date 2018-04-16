import * as TelegramBot from 'node-telegram-bot-api';
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import TelegramBotApi from '../helpers/telegram-bot-api'
import { keyboardMenu } from './defaults';

let tBot = (new TelegramBotApi()).getBot();
let settingsConversation = async function(msg: TelegramBot.Message | null, user: User, _tUser: TelegramUser):Promise<boolean> {
  if(!(msg && msg.text === user.__('settings'))) {
    return false;
  }
  tBot.sendMessage(msg.chat.id, user.__('settings'), {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
  return true;
}

let settingsCallback = async function(_msg: TelegramBot.Message, _user: User, _tUser: TelegramUser, _query:CallbackQuery):Promise<boolean> {
  return false;
}

let settingsContext = async function(_msg:TelegramBot.Message, _user: User, _tUser: TelegramUser, _context:string):Promise<boolean> {
  return false;
}

export {settingsConversation, settingsCallback, settingsContext};