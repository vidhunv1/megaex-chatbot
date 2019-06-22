import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'

// TODO: Add branching so it can be moved from one state to multiple other states;
// current: Branch<keyof T>
export interface State<T> {
  currentStateKey: T
  previousStateKey: T | null
  // TODO: Rename to label
  key: string
}

export type Parser<RootState> = (
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  currentState: RootState
) => Promise<RootState | null>

export type Responder<RootState> = (
  msg: TelegramBot.Message,
  user: User,
  currentState: RootState
) => Promise<boolean>

export enum BotCommand {
  // Global commands
  START = '/start',
  HELP = '/help',
  SETTINGS = '/settings',
  CANCEL = '/cancel',

  // App commands
  ACCOUNT = '/U',
  TRANSACTIONS = '/transactions',
  ORDER = '/O',
  TRADE = '/T'
}

export enum DeepLink {
  REFERRAL = 'ref',
  ACCOUNT = 'acc',
  ORDER = 'order',
  TRACK = 'tr',
  PAYMENT = 'cheque'
}

export interface CommandState {
  command: BotCommand
}

export interface ConversationParams {
  msg: TelegramBot.Message
  user: User
  tUser: TelegramAccount
}

export interface ChatHandler {
  handleCommand: (
    msg: TelegramBot.Message,
    command: BotCommand,
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
  handleRoot: (
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount
  ) => Promise<boolean>
}
