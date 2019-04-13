import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'

// TODO: Add branching so it can be moved from one state to multiple other states;
// current: Branch<keyof T>
export interface State<T> {
  currentMessageKey: keyof T
  key: string
}

// Record of [ currentState, nextState ]
export type StateFlow<T> = Record<keyof T, keyof T | null>

export enum BotCommand {
  // Global commands
  START = '/start',
  HELP = '/help',
  SETTINGS = '/settings',

  // App commands
  USER = '/u',
  TRANSACTIONS = '/tx'
}

export enum DeepLink {
  REFERRAL = 'ref',
  ACCOUNT = 'acc',
  ORDER = 'order',
  TRACK = 'track'
}

export interface ConversationParams {
  msg: TelegramBot.Message
  user: User
  tUser: TelegramAccount
}

export interface ChatHandler {
  handleCommand: (
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: any | null
  ) => Promise<boolean>
  handleCallback: (
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery,
    state: any | null
  ) => Promise<boolean>
  handleContext: (
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: any | null
  ) => Promise<boolean>
}
