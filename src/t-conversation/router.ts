import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from '../modules/telegram-hook'
import { CacheKeys } from '../cache-keys'
import logger from '../modules/logger'
import cacheConnection from '../modules/cache'
import NotificationManager from '../lib/notification-manager'
import {
  isBotCommand,
  parseCallbackQuery,
  keyboardMenu,
  sendErrorMessage,
  ICallbackQuery,
  ICallbackFunction
} from './defaults'

// conversation routes
import { walletConversation, walletCallback, walletContext } from './wallet'
import { tradeConversation, tradeCallback, tradeContext } from './trade'
import { infoConversation, infoCallback, infoContext } from './info'
import { accountConversation, accountCallback, accountContext } from './account'
import I18n from '../lib/i18n'
import { Market, User, TelegramAccount } from '../models'
export default class TMHandler {
  static instance: TMHandler
  tBot!: TelegramBot
  notificationManager!: NotificationManager

  constructor() {
    if (TMHandler.instance) return TMHandler.instance
    this.notificationManager = new NotificationManager()

    this.tBot = telegramHook.getBot()
    TMHandler.instance = this
  }

  async handleCallbackQuery(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery
  ) {
    const query: ICallbackQuery = callback.data
      ? parseCallbackQuery(callback.data)
      : parseCallbackQuery('')
    if (query.callbackFunction === ICallbackFunction.GoBack) {
      await this.tBot.deleteMessage(tUser.id, query.messageId + '')
      return
    }
    const isCallbackHandled: boolean =
      (await walletCallback(msg, user, tUser, query)) ||
      (await tradeCallback(msg, user, tUser, query)) ||
      (await infoCallback(msg, user, tUser, query)) ||
      (await accountCallback(msg, user, tUser, query))

    if (!isCallbackHandled) {
      logger.error('Callback not defined: ' + JSON.stringify(query))
    }
  }

  async handleMessage(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    if (!user.isTermsAccepted || !user.currencyCode) {
      if (isBotCommand(msg)) {
        this.handleConversations(msg, user, tUser)
      }
      this.onboardUser(msg, user, tUser)
    } else {
      this.handleConversations(msg, user, tUser)
    }
  }

  private async handleConversations(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    const cacheClient = await cacheConnection.getCacheClient()
    const isConversationHandled: boolean =
      (await walletConversation(msg, user, tUser)) ||
      (await tradeConversation(msg, user, tUser)) ||
      (await infoConversation(msg, user, tUser)) ||
      (await accountConversation(msg, user, tUser))

    if (!isConversationHandled && msg.text && !msg.text.startsWith('/start')) {
      const cacheKeys = new CacheKeys(tUser.id).getKeys()
      const [currentContext] = await cacheClient.hmgetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext.currentContext
      )

      const isContextHandled: boolean =
        (await this.handleBaseContext(msg, user, tUser, currentContext)) ||
        (await walletContext(msg, user, tUser, currentContext)) ||
        (await tradeContext(msg, user, tUser, currentContext)) ||
        (await infoContext(msg, user, tUser, currentContext)) ||
        (await accountContext(msg, user, tUser, currentContext))

      if (!isContextHandled) {
        this.tBot.sendMessage(msg.chat.id, user.__('unknown_message'), {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: keyboardMenu(user),
            one_time_keyboard: false,
            resize_keyboard: true
          }
        })
      }
    } else if (
      !isConversationHandled &&
      isBotCommand(msg) &&
      user.isTermsAccepted &&
      user.currencyCode &&
      msg.text &&
      msg.text.startsWith('/start')
    ) {
      this.tBot.sendMessage(msg.chat.id, user.__('initial_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
    } else if (
      !isConversationHandled &&
      user.isTermsAccepted &&
      user.currencyCode
    ) {
      sendErrorMessage(user, tUser)
    }
  }

  async onboardUser(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) {
    const languagesList = I18n.getAvailableLanguages()
    const currencyList = Market.getFiatCurrencies()
    const ccKeyboardButton: TelegramBot.ReplyKeyboardMarkup = {
      keyboard: [],
      one_time_keyboard: false,
      resize_keyboard: true
    }
    const getCurrencyCode = function(currency: string): string | null {
      for (let i = 0; i < currencyList.length; i++) {
        if (currencyList[i].name === currency) return currencyList[i].code
      }
      return null
    }

    if (msg.text && isBotCommand(msg)) {
      // entry point
      const langKeyboardButton: TelegramBot.ReplyKeyboardMarkup = {
        keyboard: [],
        one_time_keyboard: false,
        resize_keyboard: true
      }
      let i = 0
      while (i < languagesList.length) {
        langKeyboardButton.keyboard.push([{ text: languagesList[i].name }])
        if (++i >= languagesList.length) break
        langKeyboardButton.keyboard[
          langKeyboardButton.keyboard.length - 1
        ].push({ text: languagesList[i].name })
        i++
      }

      this.tBot.sendMessage(
        msg.chat.id,
        '*Hello ' +
          tUser.firstName +
          '*. Select your *language* from the options below.',
        {
          parse_mode: 'Markdown',
          reply_markup: langKeyboardButton
        }
      )
    } else if (msg.text && I18n.getLanguageCode(msg.text) != null) {
      const langCode = I18n.getLanguageCode(msg.text)
      await User.update({ locale: langCode }, { where: { id: tUser.userId } })
      await new CacheKeys(tUser.id).clearUserCache()
      user.locale = langCode || 'en'
      await this.tBot.sendMessage(msg.chat.id, user.__('get_started_guide'), {
        parse_mode: 'Markdown'
      })

      await this.tBot.sendMessage(msg.chat.id, user.__('tc_privacy'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.__('i_agree') }]],
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
    } else if (msg.text && msg.text === user.__('i_agree')) {
      await User.update(
        { isTermsAccepted: true },
        { where: { id: tUser.userId } }
      )
      await new CacheKeys(tUser.id).clearUserCache()

      let i = 0
      while (i < currencyList.length) {
        ccKeyboardButton.keyboard.push([{ text: currencyList[i].name }])
        if (++i >= currencyList.length) break
        ccKeyboardButton.keyboard[ccKeyboardButton.keyboard.length - 1].push({
          text: currencyList[i].name
        })
        if (++i >= currencyList.length) break
        ccKeyboardButton.keyboard[ccKeyboardButton.keyboard.length - 1].push({
          text: currencyList[i].name
        })
        i++
      }

      this.tBot.sendMessage(msg.chat.id, user.__('select_currency'), {
        parse_mode: 'Markdown',
        reply_markup: ccKeyboardButton
      })
    } else if (msg.text && getCurrencyCode(msg.text) != null) {
      await User.update(
        { currencyCode: getCurrencyCode(msg.text) },
        { where: { id: tUser.userId } }
      )
      await new CacheKeys(tUser.id).clearUserCache()
      this.tBot.sendMessage(msg.chat.id, user.__('initial_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
    } else {
      this.tBot.sendMessage(msg.chat.id, user.__('select_currency'), {
        parse_mode: 'Markdown',
        reply_markup: ccKeyboardButton
      })
    }
  }

  async handleBaseContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    _context: string
  ): Promise<boolean> {
    const cacheKeys = new CacheKeys(tUser.id).getKeys()
    const cacheClient = await cacheConnection.getCacheClient()
    if (
      msg.text === user.__('/cancel') ||
      msg.text === user.__('cancel_text')
    ) {
      await cacheClient.delAsync(cacheKeys.tContext.key)
      this.tBot.sendMessage(tUser.id, user.__('context_action_cancelled'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: keyboardMenu(user),
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
      return true
    }
    return false
  }
}
