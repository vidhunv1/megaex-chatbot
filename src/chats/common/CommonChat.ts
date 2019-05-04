import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import telegramHook from 'modules/TelegramHook'
import { keyboardMainMenu } from './utils'
import { CacheHelper } from 'lib/CacheHelper'
import { parseCallbackQuery } from 'chats/utils'
import { CommonStateKey } from './types'

export const CommonChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    command: BotCommand,
    user: User,
    tUser: TelegramAccount
  ) {
    switch (command) {
      case BotCommand.CANCEL: {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('action-canceled'),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
        await CacheHelper.clearState(tUser.id)
        return true
      }
    }
    return false
  },

  async handleCallback(
    msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery
  ) {
    if (callback.data && msg) {
      const { type } = parseCallbackQuery(callback.data)

      const callbackName = type as any
      if (callbackName === CommonStateKey.cb_deleteThisMessage) {
        await telegramHook.getWebhook.deleteMessage(
          msg.chat.id,
          msg.message_id + ''
        )
        return true
      }
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    _state: any
  ) {
    if (
      msg.text === user.t('actions.cancel-keyboard-button') ||
      msg.text === user.t('cancel')
    ) {
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t('action-canceled'),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      await CacheHelper.clearState(tUser.id)
      return true
    }
    return false
  }
}
