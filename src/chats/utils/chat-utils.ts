import { BotCommand, DeepLink } from 'chats/types'
import * as TelegramBot from 'node-telegram-bot-api'

export const getBotCommand = (msg: TelegramBot.Message): BotCommand | null => {
  if (!isBotCommand(msg)) {
    return null
  }

  // This cannot be undefined, so casting it
  const message = msg.text as string
  if (message.startsWith('/')) {
    if (message.startsWith(BotCommand.START)) {
      return BotCommand.START
    } else if (message.startsWith(BotCommand.SETTINGS)) {
      return BotCommand.SETTINGS
    } else if (message.startsWith(BotCommand.HELP)) {
      return BotCommand.HELP
    } else if (message.startsWith(BotCommand.USER)) {
      return BotCommand.USER
    } else if (message.startsWith(BotCommand.TRANSACTIONS)) {
      return BotCommand.TRANSACTIONS
    }
  }

  return null
}

export const parseDeepLink = (
  msg: TelegramBot.Message
): { key: DeepLink; value: string } | null => {
  if (getBotCommand(msg) === BotCommand.START && msg.text) {
    const query = msg.text.replace('/start', '').replace(' ', '')
    const [key, value] = query.split('-')
    return { key: key as DeepLink, value }
  }

  return null
}

export const isBotCommand = (msg: TelegramBot.Message) => {
  return msg.text && msg.entities && msg.entities[0].type === 'bot_command'
}

export const stringifyCallbackQuery = function<CallbackTypes, Params>(
  callbackType: CallbackTypes,
  values?: Params
) {
  let q = callbackType + ':'
  const t: any = values ? values : {}
  Object.keys(t).forEach(function(key) {
    q = q + key + '=' + t[key] + ','
  })
  return q.substring(0, q.length - 1)
}

export const parseCallbackQuery = function<CallbackTypes, CallbackParams>(
  query: string
): { type: CallbackTypes; params: CallbackParams } {
  let callbackFunction, obj, pairs: string[], tKey, tVal
  ;[callbackFunction, obj] = query.split(':')

  const params: any = {}
  pairs = obj ? obj.split(',') : []
  for (let i = 0; i < pairs.length; i++) {
    if (pairs.length > 0) {
      ;[tKey, tVal] = pairs[i].split('=')
      params[tKey] = tVal
    }
  }

  return {
    type: (callbackFunction as unknown) as CallbackTypes,
    params: params as CallbackParams
  }
}
