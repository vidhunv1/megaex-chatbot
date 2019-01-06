import * as TelegramBot from 'node-telegram-bot-api'
import TelegramUser from '../models/telegram_user'
import User from '../models/user'
import TelegramBotApi from '../helpers/telegram-bot-api'
import {
  ICallbackQuery,
  ICallbackFunction,
  stringifyCallbackQuery
} from './defaults'

const tBot = new TelegramBotApi().getBot()
const infoConversation = async function(
  msg: TelegramBot.Message | null,
  user: User,
  _tUser: TelegramUser
): Promise<boolean> {
  if (!(msg && msg.text === user.__('menu_info'))) {
    return false
  }
  tBot.sendMessage(msg.chat.id, user.__('info_message'), {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          { text: user.__('contact_support'), url: user.__('support_link') },
          { text: user.__('join_group'), url: user.__('group_link') }
        ],
        [
          {
            text: user.__('referral_link'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.ReferralLink,
              null,
              null
            )
          }
        ],
        [
          {
            text: user.__('starter_guide'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.StarterGuide,
              null,
              null
            )
          }
        ]
      ],
      one_time_keyboard: false,
      resize_keyboard: true
    }
  })
  return true
}

const infoCallback = async function(
  _msg: TelegramBot.Message,
  _user: User,
  _tUser: TelegramUser,
  _query: ICallbackQuery
): Promise<boolean> {
  return false
}

const infoContext = async function(
  _msg: TelegramBot.Message,
  _user: User,
  _tUser: TelegramUser,
  _context: string
): Promise<boolean> {
  return false
}

export { infoConversation, infoCallback, infoContext }
