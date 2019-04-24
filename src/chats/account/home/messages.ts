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

export const AccountHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  async showAccount(
    accountId: string,
    totalDeals: number,
    tradeVolume: number,
    cryptoCode: CryptoCurrency,
    avgSpeedSec: number,
    rating: {
      percentage: number
      upvotes: number
      downvotes: number
    },
    referralCount: number,
    earnings: number,
    addedPaymentMethods: PaymentMethods[]
  ) {
    const inline: TelegramBot.InlineKeyboardButton[][] = [
      [
        {
          text: user.t(`${Namespace.Account}:manage-payment-methods-cbbutton`),
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
          text: user.t(`${Namespace.Account}:referral-link-cbbutton`),
          callback_data: stringifyCallbackQuery<
            ReferralStateKey.cb_referralLink,
            ReferralState[ReferralStateKey.cb_referralLink]
          >(ReferralStateKey.cb_referralLink, {
            mId: msg.message_id,
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:settings-cbbutton`),
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
        text: user.t(`${Namespace.Account}:verify-account-cbbutton`),
        url: VERIFY_ACCOUNT_PATH
      })

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:account-home`, {
        accountID: accountId,
        dealCount: totalDeals,
        tradeVolume: tradeVolume,
        cryptoCurrencyCode: cryptoCode,
        tradeSpeed: parseInt(avgSpeedSec / 60 + ''),
        ratingPercentage: rating.percentage,
        upvotes: rating.upvotes,
        downvotes: rating.downvotes,
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
    return user.t(`${Namespace.Account}:account-no-payment-method`)
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
