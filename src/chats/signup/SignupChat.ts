import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from '../../models'
import { ChatHandler, DeepLink } from '../../types'
import { parseDeepLink } from '../utils/chat-utils'
// import telegramHook from '../../modules/telegram-hook'
// import { InitialState } from './signup-context'

/* 
    Signup conversation graph:

    -> /start -> May include referral, order or user information. This needs to be cached to be processed post sign-up.
    -> Choose language
    -> Choose currency 
*/

export const SignupChat: ChatHandler = {
    async handleCommand(msg: TelegramBot.Message, user: User, _tUser: TelegramAccount) {
        // const tBot = telegramHook.getBot

        if (!user.isTermsAccepted || !user.currencyCode || !user.locale) {
            const deepLinks = parseDeepLink(msg)
            
            if (deepLinks != null) {
                const { key } = deepLinks
                if (key === DeepLink.ACCOUNT) {
                    throw Error('TODO: Save show-account to show after signup')
                } else if (key === DeepLink.ORDER) {
                    throw Error('TODO: Handle show-order to show after signup')
                } else if (key === DeepLink.REFERRAL) {
                    throw Error('TODO: Save referral')
                }
            }
            
            // Handle signup
            // const i18n = I18n.getI18n
            // console.log('Sending message: ' + i18n.__('greeting.formal'))
            // tBot.sendMessage(msg.chat.id, i18n.__('error_unknown'))            
            return true
        } else {
            return false
        }
    },

    async handleCallback(_msg: TelegramBot.Message, _user: User, _tUser: TelegramAccount, _callback: TelegramBot.CallbackQuery) {
        console.log('Handling signup callback')
        return false
    },

    async handleContext(_msg: TelegramBot.Message, _user: User, _tUser: TelegramAccount) {
        console.log('Handling signup context')
        return false
    }
}