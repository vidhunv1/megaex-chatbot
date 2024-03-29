import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'

import { SignupChat } from 'chats/signup'
import { ExchangeChat } from 'chats/exchange'
import { WalletChat } from 'chats/wallet'
import { AccountChat } from 'chats/account'

import { getBotCommand } from 'chats/utils'
import { CacheHelper } from 'lib/CacheHelper'
import { telegramHook } from 'modules'
import { logger } from 'modules'
import { CommonChat, keyboardMainMenu } from 'chats/common'
import { CONFIG } from '../../config'

export const Router = {
  async routeMessage(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    const currentState = await CacheHelper.getState<any>(tUser.id)

    const botCommand = getBotCommand(msg)
    if (botCommand) {
      // Command handlers
      const isHandled =
        (await SignupChat.handleCommand(
          msg,
          botCommand,
          user,
          tUser,
          currentState
        )) ||
        (await CommonChat.handleCommand(
          msg,
          botCommand,
          user,
          tUser,
          currentState
        )) ||
        (await ExchangeChat.handleCommand(
          msg,
          botCommand,
          user,
          tUser,
          currentState
        )) ||
        (await WalletChat.handleCommand(
          msg,
          botCommand,
          user,
          tUser,
          currentState
        )) ||
        (await AccountChat.handleCommand(
          msg,
          botCommand,
          user,
          tUser,
          currentState
        ))

      if (!isHandled) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('error.bad-message', {
            supportBotUsername: CONFIG.SUPPORT_USERNAME
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
      }
    } else {
      let isHandled = false

      isHandled =
        (await SignupChat.handleRoot(msg, user, tUser)) ||
        (await CommonChat.handleRoot(msg, user, tUser)) ||
        (await ExchangeChat.handleRoot(msg, user, tUser)) ||
        (await WalletChat.handleRoot(msg, user, tUser)) ||
        (await AccountChat.handleRoot(msg, user, tUser))

      isHandled =
        isHandled ||
        (await SignupChat.handleContext(msg, user, tUser, currentState)) ||
        (await CommonChat.handleContext(msg, user, tUser, currentState)) ||
        (await ExchangeChat.handleContext(msg, user, tUser, currentState)) ||
        (await WalletChat.handleContext(msg, user, tUser, currentState)) ||
        (await AccountChat.handleContext(msg, user, tUser, currentState))

      if (!isHandled) {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('error.bad-message', {
            supportBotUsername: CONFIG.SUPPORT_USERNAME
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
      }
    }
  },

  async routeCallback(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery
  ) {
    const currentState = await CacheHelper.getState<any>(tUser.id)
    const isHandled =
      (await CommonChat.handleCallback(
        msg,
        user,
        tUser,
        callback,
        currentState
      )) ||
      (await ExchangeChat.handleCallback(
        msg,
        user,
        tUser,
        callback,
        currentState
      )) ||
      (await WalletChat.handleCallback(
        msg,
        user,
        tUser,
        callback,
        currentState
      )) ||
      (await AccountChat.handleCallback(
        msg,
        user,
        tUser,
        callback,
        currentState
      )) ||
      (await SignupChat.handleCallback(
        msg,
        user,
        tUser,
        callback,
        currentState
      ))

    if (!isHandled) {
      logger.error(`Callback query not handled: ${JSON.stringify(callback)}`)

      await telegramHook.getWebhook.answerCallbackQuery(callback.id, {
        text: user.t('callback-error-response')
      })

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t('unhandled-callback'),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
    } else {
      await telegramHook.getWebhook.answerCallbackQuery(callback.id, {})
    }

    if (!callback.data) {
      logger.error(`Callback data is undefined: ${JSON.stringify(callback)}`)
    }
  }
}
