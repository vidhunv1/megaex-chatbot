import * as TelegramBot from 'node-telegram-bot-api'

enum BotCommand {
  // Global commands
  START = '/start',
  HELP = '/help',
  SETTINGS = '/settings',

  // App commands
  USER = '/u',
  TRANSACTIONS = '/tx'
}

enum DeepLink {
  REFERRAL = 'ref',
  ACCOUNT = 'acc',
  ORDER = 'order'
}

interface ConversationParams {
  msg: TelegramBot.Message
  user: User
  tUser: TelegramAccount
}

export interface ConversationHandler {
  handleCommand: (command: BotCommand, user: User, tUser: TelegramAccount) => Promise<boolean>
  handleCallback: (msg: TelegramBot.Message, user: User, tUser: TelegramAccount, callback: TelegramBot.CallbackQuery) => Promise<boolean>
  handleContext: (msg: TelegramBot.Message, user: User, tUser: TelegramAccount) => Promise<boolean>
}
