import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from '../../models'
import { SignupHandler } from '../signup'
import { getBotCommand } from '../utils'

export const Router = {
    routeMessage(msg: TelegramBot.Message, user: User, tUser: TelegramAccount) {
        if (!user.isTermsAccepted || !user.currencyCode || !user.locale) {
            const botCommand = getBotCommand(msg)
            if (botCommand) {
                SignupHandler.handleCommand(botCommand, user, tUser)
            } else {
                SignupHandler.handleContext(msg, user, tUser)
            }
        } else {
            throw Error('TODO: Route the rest')
        }
    },
    
    routeCallback(_msg: TelegramBot.Message, _user: User, _tUser: TelegramAccount, _callback: TelegramBot.CallbackQuery) {
        throw Error('TODO: Not implemented')
    }
}