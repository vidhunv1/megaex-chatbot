import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from '../../models'
import { ChatHandler } from '../../types'

export const DefaultChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    user: User,
    _tUser: TelegramAccount
  ) {
    return false
  },

  async handleCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    console.log('Handling default callback')
    return false
  },

  async handleContext(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount
  ) {
    console.log('Handling default context')
    return false
  }
}
