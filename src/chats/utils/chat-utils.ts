import { BotCommand, DeepLink } from 'chats/types'
import * as TelegramBot from 'node-telegram-bot-api'

export const getBotCommand = (msg: TelegramBot.Message): BotCommand | null => {
  if (!isBotCommand(msg)) {
    return null
  }

  // This cannot be undefined, so casting it
  const message = msg.text as string
  if (message.startsWith('/')) {
    if (message.startsWith(BotCommand.CANCEL)) {
      return BotCommand.CANCEL
    } else if (message.startsWith(BotCommand.START)) {
      return BotCommand.START
    } else if (message.startsWith(BotCommand.SETTINGS)) {
      return BotCommand.SETTINGS
    } else if (message.startsWith(BotCommand.HELP)) {
      return BotCommand.HELP
    } else if (message.startsWith(BotCommand.ACCOUNT)) {
      return BotCommand.ACCOUNT
    } else if (message.startsWith(BotCommand.TRANSACTIONS)) {
      return BotCommand.TRANSACTIONS
    } else if (message.startsWith(BotCommand.ORDER)) {
      return BotCommand.ORDER
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

// { wallet, { currencyCode: 1, b = 2 }} => wallet:currencyCode=1,b=2, skips data field
export const stringifyCallbackQuery = function<StateKey, Params>(
  callbackType: StateKey,
  values?: Params
) {
  let q = callbackType + ':'
  const t: any = values ? values : {}
  Object.keys(t).forEach(function(key) {
    if (key != 'data') {
      q = q + key + '=' + t[key] + ','
    }
  })
  const a = q.substring(0, q.length - 1)
  return a
}

export const parseCallbackQuery = function(
  query: string
): { type: string; params: any } {
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
    type: callbackFunction,
    params: params as any
  }
}
