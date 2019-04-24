import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { AccountHomeStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { PaymentMethodStateKey, PaymentMethodState } from '../paymentMethods'
import { ReferralStateKey, ReferralState } from '../referral'
import { SettingsStateKey, SettingsState } from '../settings'
import { CryptoCurrency } from 'constants/currencies'
import { PaymentMethods } from 'constants/paymentMethods'
import { User } from 'models'
import { VERIFY_ACCOUNT_PATH } from 'constants/paths'

export const AccountHomeResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<AccountHomeStateKey, () => Promise<boolean>> = {
    [AccountHomeStateKey.start]: async () => {
      return false
    },

    [AccountHomeStateKey.account]: async () => {
      const data = _.get(currentState[AccountHomeStateKey.start], 'data', null)
      if (!data) {
        return false
      }

      const inline: TelegramBot.InlineKeyboardButton[][] = [
        [
          {
            text: user.t(
              `${Namespace.Account}:manage-payment-methods-cbbutton`
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
          accountID: data.accountId,
          dealCount: data.totalDeals,
          tradeVolume: data.totalVolume,
          cryptoCurrencyCode: CryptoCurrency.BTC,
          tradeSpeed: parseInt(data.avgSpeedSec / 60 + ''),
          ratingPercentage: data.rating.totalPercentage,
          upvotes: data.rating.upVotes,
          downvotes: data.rating.downVotes,
          referralCount: data.referralCount,
          earnings: data.totalEarnings,
          paymentMethods: stringifyPaymentMethods(
            data.addedPaymentMethods,
            user
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: inline
          }
        }
      )
      return true
    }
  }

  return resp[currentState.currentStateKey as AccountHomeStateKey]()
}

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
