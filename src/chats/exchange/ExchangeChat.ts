import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  EXCHANGE_STATE_KEY,
  ExchangeState,
  initialState,
  nextExchangeState
} from './ExchangeState'
import telegramHook from 'modules/TelegramHook'
import { defaultKeyboardMenu } from 'chats/common'
import { Namespace } from 'modules/i18n'
import { CONFIG } from '../../config'

export const ExchangeChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
    _user: User,
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
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state
  ) {
    let currentState = state
    if (
      msg.text ===
      user.t('main-menu.exchange', { fiatCurrency: user.currencyCode })
    ) {
      currentState = initialState
    }

    if (currentState.key === EXCHANGE_STATE_KEY) {
      const nextState: ExchangeState | null = await parseInput(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return sendResponse(msg, user, nextState)
    } else {
      return false
    }
  }
}

async function parseInput(
  _msg: TelegramBot.Message,
  telegramId: number,
  _user: User,
  currentState: ExchangeState
): Promise<ExchangeState | null> {
  switch (currentState.currentMessageKey) {
    case 'exchange':
      return await nextExchangeState(currentState, telegramId)
    default:
      return null
  }
}

async function sendResponse(
  msg: TelegramBot.Message,
  user: User,
  nextState: ExchangeState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'exchange':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Exchange}:exchange-home`, {
          fiatCurrency: user.currencyCode,
          supportBotUsername: `@${CONFIG.SUPPORT_USERNAME}`
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user)
        }
      )
      return true
  }

  return false
}
