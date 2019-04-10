import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { SignupChat } from 'chats/signup'
import { getBotCommand } from 'chats/utils'
import { CacheHelper } from 'lib/CacheHelper'

export const Router = {
  async routeMessage(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    const botCommand = getBotCommand(msg)
    if (botCommand) {
      const isHandled = SignupChat.handleCommand(msg, user, tUser)

      if (!isHandled) {
        throw Error('TODO: Send unknow command message')
      }
    } else {
      const currentState = await CacheHelper.getState<any>(tUser.id)
      const isHandled = SignupChat.handleContext(msg, user, tUser, currentState)

      if (!isHandled) {
        throw Error('TODO: Send unknown context message')
      }
    }
  },

  routeCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    throw Error('TODO: Not implemented')
  }
}
