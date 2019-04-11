import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { SignupChat } from 'chats/signup'
import { ExchangeChat } from 'chats/exchange'
import { getBotCommand } from 'chats/utils'
import { CacheHelper } from 'lib/CacheHelper'
import telegramHook from 'modules/TelegramHook'
import { defaultKeyboardMenu } from 'chats/common'
import { CONFIG } from '../../config'

export const Router = {
  async routeMessage(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    const botCommand = getBotCommand(msg)
    if (botCommand) {
      // Command handlers
      const isHandled = SignupChat.handleCommand(msg, user, tUser)

      if (!isHandled) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('error.bad-message', {
            supportBotUsername: CONFIG.SUPPORT_USERNAME
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: defaultKeyboardMenu(user)
          }
        )
      }
    } else {
      const currentState = await CacheHelper.getState<any>(tUser.id)

      // Context Handlers
      const isHandled =
        (await SignupChat.handleContext(msg, user, tUser, currentState)) ||
        (await ExchangeChat.handleContext(msg, user, tUser, currentState))

      if (!isHandled) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('error.bad-message', {
            supportBotUsername: CONFIG.SUPPORT_USERNAME
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: defaultKeyboardMenu(user)
          }
        )
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
