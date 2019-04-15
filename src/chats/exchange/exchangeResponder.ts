import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CONFIG } from '../../config'
import { stringifyCallbackQuery } from 'chats/utils'
import { CallbackTypes, CallbackParams } from './constants'
import { ExchangeState } from './ExchangeState'

export async function exchangeResponder(
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
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Exchange}:my-orders`, {
                    orderCount: 0
                  }),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.MY_ORDERS,
                    CallbackParams[CallbackTypes.MY_ORDERS]
                  >(CallbackTypes.MY_ORDERS, {
                    messageId: msg.message_id
                  })
                },
                {
                  text: user.t(`${Namespace.Exchange}:create-order`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.CREATE_ORDER,
                    CallbackParams[CallbackTypes.CREATE_ORDER]
                  >(CallbackTypes.CREATE_ORDER, {
                    messageId: msg.message_id
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Exchange}:buy`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.BUY,
                    CallbackParams[CallbackTypes.BUY]
                  >(CallbackTypes.BUY, {
                    messageId: msg.message_id
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Exchange}:sell`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.SELL,
                    CallbackParams[CallbackTypes.SELL]
                  >(CallbackTypes.SELL, {
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
