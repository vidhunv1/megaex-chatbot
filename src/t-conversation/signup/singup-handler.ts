import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from '../../models'
import { ConversationHandler, BotCommand } from '../types'

export const SignupHandler: ConversationHandler = {
    async handleCommand(command: BotCommand, _user: User, _tUser: TelegramAccount) {
        return false
    },

    async handleCallback(_msg: TelegramBot.Message, _user: User, _tUser: TelegramAccount, _callback: TelegramBot.CallbackQuery) {
        return false
    },

    async handleContext(_msg: TelegramBot.Message, _user: User, _tUser: TelegramAccount) {
        return false
    }
}