import { AccountHomeStateKey, AccountHomeState } from './types'
import { Parser } from 'chats/types'
import {
  updateNextAccountState,
  AccountStateKey,
  AccountState
} from '../AccountState'
import * as _ from 'lodash'
import Message from 'models/Message'
import { User, TelegramAccount } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'

export const AccountHomeParser: Parser<AccountState> = async (
  msg,
  user,
  tUser,
  state
) => {
  const parser: Record<
    AccountHomeStateKey,
    () => Promise<AccountState | null>
  > = {
    [AccountHomeStateKey.account]: async () => {
      return null
    },

    [AccountHomeStateKey.start]: async () => {
      return state
    },

    [AccountHomeStateKey.cb_showReviews]: async () => {
      return {
        ...state,
        [AccountHomeStateKey.showReviews]: {
          data: {
            shouldEdit: false,
            cursor: 0
          }
        }
      }
    },

    [AccountHomeStateKey.showReviews]: async () => {
      return null
    },

    [AccountHomeStateKey.cb_reviewShowMore]: async () => {
      const cursor = _.get(
        state[AccountHomeStateKey.cb_reviewShowMore],
        'cursor',
        0
      )
      return {
        ...state,
        [AccountHomeStateKey.showReviews]: {
          data: {
            shouldEdit: true,
            cursor
          }
        }
      }
    },

    [AccountHomeStateKey.cb_sendMessage]: async () => {
      return state
    },

    [AccountHomeStateKey.sendMessage]: async () => {
      const userId = _.get(
        state[AccountHomeStateKey.cb_sendMessage],
        'toUserId',
        null
      )
      const tradeId = parseInt(
        _.get(state[AccountHomeStateKey.cb_sendMessage], 'tradeId', null) + ''
      )
      const tradeInfo =
        tradeId >= 0
          ? '\n' +
            user.t(`${Namespace.Account}:home.trade-message`, {
              tradeId: tradeId
            })
          : ''

      if (userId) {
        const u = await User.findById(userId, {
          include: [{ model: TelegramAccount }]
        })
        if (!u) {
          return null
        }
        if (msg.document) {
          const message = await Message.createMessage(
            user.id,
            userId,
            msg.document.file_id
          )
          await telegramHook.getWebhook.sendMessage(
            u.telegramUser.id,
            u.t(`${Namespace.Account}:home.new-message`, {
              accountId: user.accountId,
              messageContent: msg.document.file_name,
              tradeInfo: tradeInfo
            }),
            {
              parse_mode: 'HTML'
            }
          )
          await telegramHook.getWebhook.sendDocument(
            u.telegramUser.id,
            msg.document.file_id,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: user.t(
                        `${Namespace.Account}:home.send-response-cbbutton`
                      ),
                      callback_data: stringifyCallbackQuery<
                        AccountHomeStateKey.cb_sendMessage,
                        AccountHomeState[AccountHomeStateKey.cb_sendMessage]
                      >(AccountHomeStateKey.cb_sendMessage, {
                        toUserId: user.id,
                        tradeId: null
                      })
                    }
                  ]
                ]
              }
            }
          )
          return {
            ...state,
            [AccountHomeStateKey.sendMessage]: {
              sentMessage: message.message
            }
          }
        } else if (msg.photo) {
          const photo = msg.photo[msg.photo.length - 1]
          const message = await Message.createMessage(
            user.id,
            userId,
            photo.file_id
          )
          await telegramHook.getWebhook.sendMessage(
            u.telegramUser.id,
            u.t(`${Namespace.Account}:home.new-photo-message`, {
              accountId: user.accountId,
              tradeInfo: tradeInfo
            }),
            {
              parse_mode: 'HTML'
            }
          )
          await telegramHook.getWebhook.sendPhoto(
            u.telegramUser.id,
            photo.file_id,
            {
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: user.t(
                        `${Namespace.Account}:home.send-response-cbbutton`
                      ),
                      callback_data: stringifyCallbackQuery<
                        AccountHomeStateKey.cb_sendMessage,
                        AccountHomeState[AccountHomeStateKey.cb_sendMessage]
                      >(AccountHomeStateKey.cb_sendMessage, {
                        toUserId: user.id,
                        tradeId: null
                      })
                    }
                  ]
                ]
              }
            }
          )
          return {
            ...state,
            [AccountHomeStateKey.sendMessage]: {
              sentMessage: message.message
            }
          }
        } else if (msg.text) {
          const message = await Message.createMessage(user.id, userId, msg.text)
          await telegramHook.getWebhook.sendMessage(
            u.telegramUser.id,
            u.t(`${Namespace.Account}:home.new-message`, {
              accountId: user.accountId,
              messageContent: message.message.substring(0, 400),
              tradeInfo: tradeInfo
            }),
            {
              parse_mode: 'HTML',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: user.t(
                        `${Namespace.Account}:home.send-response-cbbutton`
                      ),
                      callback_data: stringifyCallbackQuery<
                        AccountHomeStateKey.cb_sendMessage,
                        AccountHomeState[AccountHomeStateKey.cb_sendMessage]
                      >(AccountHomeStateKey.cb_sendMessage, {
                        toUserId: user.id,
                        tradeId: null
                      })
                    }
                  ]
                ]
              }
            }
          )
          return {
            ...state,
            [AccountHomeStateKey.sendMessage]: {
              sentMessage: message.message
            }
          }
        }
      }
      return state
    },

    [AccountHomeStateKey.messageSent]: async () => {
      return null
    }
  }

  const updatedState = await parser[
    state.currentStateKey as AccountHomeStateKey
  ]()
  const nextStateKey = nextAccountHomeState(updatedState)
  const nextState = updateNextAccountState(updatedState, nextStateKey, tUser.id)

  return nextState
}

export function nextAccountHomeState(
  state: AccountState | null
): AccountStateKey | null {
  if (state === null) {
    return null
  }

  switch (state.currentStateKey) {
    case AccountHomeStateKey.start:
      return AccountHomeStateKey.account
    case AccountHomeStateKey.account:
      return null
    case AccountHomeStateKey.cb_showReviews:
      return AccountHomeStateKey.showReviews
    case AccountHomeStateKey.cb_reviewShowMore:
      return AccountHomeStateKey.showReviews
    case AccountHomeStateKey.cb_sendMessage:
      return AccountHomeStateKey.sendMessage
    case AccountHomeStateKey.sendMessage:
      return AccountHomeStateKey.messageSent
    default:
      return null
  }
}
