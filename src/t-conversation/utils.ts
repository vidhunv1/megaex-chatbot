import{ BotCommand, DeepLink } from './types'
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