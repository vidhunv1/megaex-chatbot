import * as TelegramBot from 'node-telegram-bot-api';
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import TelegramBotApi from '../helpers/telegram-bot-api'
import { keyboardMenu } from './defaults';

let tBot = (new TelegramBotApi()).getBot();
let infoConversation = async function(msg: TelegramBot.Message | null, user: User, _tUser: TelegramUser):Promise<boolean> {
  if(!(msg && msg.text === user.__('info'))) {
    return false;
  }
  tBot.sendMessage(msg.chat.id, user.__('info'), {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: keyboardMenu(user),
      one_time_keyboard: false,
      resize_keyboard: true
    }
  });
  return true;
}

let infoCallback = async function(_msg: TelegramBot.Message, _user: User, _tUser: TelegramUser, _query:CallbackQuery):Promise<boolean> {
  return false;
}

let infoContext = async function(_msg:TelegramBot.Message, _user: User, _tUser: TelegramUser, _context:string):Promise<boolean> {
  return false;
}

export {infoConversation, infoCallback, infoContext};