import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  WALLET_STATE_KEY,
  WalletState,
  initialState,
  nextExchangeState
} from './WalletState'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { CallbackTypes, CallbackParams } from './constants'
import { CryptoCurrency } from 'constants/currencies'

export const WalletChat: ChatHandler = {
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
    if (msg.text === user.t('main-menu.wallet')) {
      currentState = initialState
    }

    if (currentState.key === WALLET_STATE_KEY) {
      const nextState: WalletState | null = await parseInput(
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
  currentState: WalletState
): Promise<WalletState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      return await nextExchangeState(currentState, telegramId)
    default:
      return null
  }
}

async function sendResponse(
  msg: TelegramBot.Message,
  user: User,
  nextState: WalletState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'wallet':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:wallet-home`, {
          fiatCurrencyCode: user.currencyCode,
          cryptoCurrencyCode: CryptoCurrency.BTC,
          fiatBalance: 10000,
          cryptoBalance: 0.1,
          blockedBalance: 0.005,
          referralCount: 100,
          earnings: 0.05
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Wallet}:send-cryptocurrency`, {
                    orderCount: 0
                  }),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.SEND_CURRENCY,
                    CallbackParams[CallbackTypes.SEND_CURRENCY]
                  >(CallbackTypes.SEND_CURRENCY, {
                    messageId: msg.message_id
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.MY_ADDRESS,
                    CallbackParams[CallbackTypes.MY_ADDRESS]
                  >(CallbackTypes.MY_ADDRESS, {
                    messageId: msg.message_id
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.WITHDRAW,
                    CallbackParams[CallbackTypes.WITHDRAW]
                  >(CallbackTypes.WITHDRAW, {
                    messageId: msg.message_id
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    default:
      return false
  }
}
