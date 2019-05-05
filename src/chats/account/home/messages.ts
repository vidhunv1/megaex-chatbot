import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { PaymentMethodStateKey, PaymentMethodState } from '../paymentMethods'
import { ReferralStateKey, ReferralState } from '../referral'
import { SettingsStateKey, SettingsState } from '../settings'
import { VERIFY_ACCOUNT_PATH } from 'constants/paths'
import { CryptoCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'
import { AccountHomeError } from './types'
import { CommonStateKey, CommonState } from 'chats/common/types'

export const AccountHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  async showError(accountError: AccountHomeError) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.errors.${accountError}`),
      {
        parse_mode: 'Markdown'
      }
    )
  },
  async showDealerAccount(
    accountID: string,
    telegramUsername: string,
    dealCount: number,
    tradeVolume: number,
    cryptoCurrencyCode: CryptoCurrency,
    tradeSpeedSec: number,
    rating: number,
    reviewCount: number
    // isUserBlocked: boolean
  ) {
    // TODO: Add block and sendMessage
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.dealer-account`, {
        accountId: accountID,
        telegramUsername: telegramUsername,
        dealCount: dealCount,
        tradeVolume: tradeVolume,
        cryptoCurrencyCode: cryptoCurrencyCode,
        tradeSpeed: tradeSpeedSec,
        rating: rating
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(
                  `${Namespace.Account}:home.user-reviews-cbbutton`,
                  {
                    reviewCount: reviewCount
                  }
                ),
                callback_data: stringifyCallbackQuery<
                  CommonStateKey.cb_deleteThisMessage,
                  CommonState[CommonStateKey.cb_deleteThisMessage]
                >(CommonStateKey.cb_deleteThisMessage, {})
              }
            ]
            // [
            //   {
            //     text: isUserBlocked ? user.t(`${Namespace.Account}:home.unblock-dealer-cbbutton`) : user.t(`${Namespace.Account}:home.block-dealer-cbbutton`),
            //     callback_data: stringifyCallbackQuery<
            //       CommonStateKey.cb_deleteThisMessage,
            //       CommonState[CommonStateKey.cb_deleteThisMessage]
            //     >(CommonStateKey.cb_deleteThisMessage, {})
            //   },
            //   {
            //     text: user.t(`${Namespace.Account}:home.send-message-dealer-cbbutton`),
            //     callback_data: stringifyCallbackQuery<
            //       CommonStateKey.cb_deleteThisMessage,
            //       CommonState[CommonStateKey.cb_deleteThisMessage]
            //     >(CommonStateKey.cb_deleteThisMessage, {})
            //   },
            // ]
          ]
        }
      }
    )
  },
  async showAccount(
    accountId: string,
    totalDeals: number,
    tradeVolume: number,
    cryptoCode: CryptoCurrency,
    avgSpeedSec: number,
    rating: number,
    referralCount: number,
    earnings: number,
    addedPaymentMethods: PaymentMethods[]
  ) {
    const inline: TelegramBot.InlineKeyboardButton[][] = [
      [
        {
          text: user.t(
            `${Namespace.Account}:home.manage-payment-methods-cbbutton`
          ),
          callback_data: stringifyCallbackQuery<
            PaymentMethodStateKey.cb_paymentMethods,
            PaymentMethodState[PaymentMethodStateKey.cb_paymentMethods]
          >(PaymentMethodStateKey.cb_paymentMethods, {
            mId: msg.message_id,
            data: null
          })
        }
      ],
      [
        {
          text: user.t(`${Namespace.Account}:home.referral-link-cbbutton`),
          callback_data: stringifyCallbackQuery<
            ReferralStateKey.cb_referralLink,
            ReferralState[ReferralStateKey.cb_referralLink]
          >(ReferralStateKey.cb_referralLink, {
            mId: msg.message_id,
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:home.settings-cbbutton`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_settings,
            SettingsState[SettingsStateKey.cb_settings]
          >(SettingsStateKey.cb_settings, {
            mId: msg.message_id,
            isFromBack: false,
            data: null
          })
        }
      ]
    ]

    !user.isVerified &&
      inline[0].push({
        text: user.t(`${Namespace.Account}:home.verify-account-cbbutton`),
        url: VERIFY_ACCOUNT_PATH
      })

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.account`, {
        accountID: accountId,
        dealCount: totalDeals,
        tradeVolume: tradeVolume,
        cryptoCurrencyCode: cryptoCode,
        tradeSpeed: parseInt(avgSpeedSec / 60 + ''),
        rating: rating,
        referralCount: referralCount,
        earnings: earnings,
        paymentMethods: stringifyPaymentMethods(addedPaymentMethods, user)
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      }
    )
  }
})

const stringifyPaymentMethods = (
  paymentMethods: PaymentMethods[],
  user: User
) => {
  if (paymentMethods.length === 0) {
    return user.t(`${Namespace.Account}:home.no-payment-method`)
  }
  let pmStringified = '\n'
  paymentMethods.forEach((pm, index) => {
    pmStringified = pmStringified + user.t(`payment-methods.names.${pm}`)

    if (index < paymentMethods.length - 1) {
      pmStringified = pmStringified + ', '
    } else {
      pmStringified = pmStringified + ' '
    }
  })
  return pmStringified
}
