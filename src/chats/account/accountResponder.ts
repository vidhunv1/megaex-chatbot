import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { AccountState } from './AccountState'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CryptoCurrency } from 'constants/currencies'
import { stringifyCallbackQuery } from 'chats/utils'
import { CallbackTypes, CallbackParams } from './constants'
import logger from 'modules/Logger'
import { VERIFY_ACCOUNT_PATH } from 'constants/paths'

export async function accountResponder(
  msg: TelegramBot.Message,
  user: User,
  nextState: AccountState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'account':
      logger.error('TODO: Add manage/edit payment methods')
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:account-home`, {
          accountID: 'U9SAE8',
          dealCount: 100,
          tradeVolume: 100,
          cryptoCurrencyCode: CryptoCurrency.BTC,
          tradeSpeed: '2 mins',
          ratingPercentage: 98,
          upvotes: 100,
          downvotes: 3,
          referralCount: 100,
          earnings: 5,
          paymentMethods: 'BankTransfer, PayTM'
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Account}:manage-payment-methods`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.PAYMENT_METHODS,
                    CallbackParams[CallbackTypes.PAYMENT_METHODS]
                  >(CallbackTypes.PAYMENT_METHODS, {
                    messageId: msg.message_id
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Account}:verify-account`),
                  url: VERIFY_ACCOUNT_PATH
                },
                {
                  text: user.t(`${Namespace.Account}:referral-link`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.REFERRAL_LINK,
                    CallbackParams[CallbackTypes.REFERRAL_LINK]
                  >(CallbackTypes.REFERRAL_LINK, {
                    messageId: msg.message_id
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    default:
      return false
  }
}