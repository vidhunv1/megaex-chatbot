import { telegramHook } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, PaymentMethodFields } from 'models'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { PaymentMethodStateKey, PaymentMethodState } from '../paymentMethods'
import { ReferralStateKey, ReferralState } from '../referral'
import { SettingsStateKey, SettingsState } from '../settings'
import { CryptoCurrency } from 'constants/currencies'
import {
  AccountHomeError,
  AccountHomeStateKey,
  AccountHomeState
} from './types'
import { CommonStateKey, CommonState } from 'chats/common/types'
import { PaymentMethodPrimaryFieldIndex } from 'constants/paymentMethods'
import { dataFormatter } from 'utils/dataFormatter'
import { keyboardMainMenu } from 'chats/common'
import { CONFIG } from '../../../config'

export const AccountHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  async noReviewsAvailable() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.no-reviews-available`),
      {
        parse_mode: 'Markdown'
      }
    )
  },
  async inputSendMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.enter-message`),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [[{ text: user.t('actions.cancel-keyboard-button') }]],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      }
    )
  },

  async messageSent(message: string | null) {
    let text
    if (message) {
      text = user.t(`${Namespace.Account}:home.message-sent`)
    } else {
      text = user.t(`${Namespace.Account}:home.message-not-sent`)
    }

    await telegramHook.getWebhook.sendMessage(msg.chat.id, text, {
      parse_mode: 'Markdown',
      reply_markup: keyboardMainMenu(user)
    })
  },

  async showReview(
    currentCursor: number,
    totalReviews: number,
    opAccountId: string,
    reviewerName: string,
    review: string | null,
    rating: number,
    dealVolume: number,
    cryptoCurrencyCode: CryptoCurrency,
    shouldEdit: boolean
  ) {
    const message = user.t(`${Namespace.Account}:home.user-review`, {
      currentPage: currentCursor + 1,
      totalPages: totalReviews,
      opAccountId: opAccountId,
      reviewerName: reviewerName,
      tradeVolume: dealVolume,
      cryptoCurrencyCode: cryptoCurrencyCode,
      rating: '⭐'.repeat(rating),
      review: review == null ? '' : `"${review}"`
      // (rating + '🌟' + (review && `  _"${review || '-'}"_`))
    })

    const hasMoreReviews: boolean = currentCursor + 1 < totalReviews

    const inline: TelegramBot.InlineKeyboardButton[][] = [
      [
        {
          text: user.t(`${Namespace.Account}:home.back-cbbutton`),
          callback_data: stringifyCallbackQuery<
            CommonStateKey.cb_deleteThisMessage,
            CommonState[CommonStateKey.cb_deleteThisMessage]
          >(CommonStateKey.cb_deleteThisMessage, {})
        },
        {
          text: user.t(`${Namespace.Account}:home.more-cbbutton`),
          callback_data: stringifyCallbackQuery<
            AccountHomeStateKey.cb_reviewShowMore,
            AccountHomeState[AccountHomeStateKey.cb_reviewShowMore]
          >(AccountHomeStateKey.cb_reviewShowMore, {
            cursor: hasMoreReviews ? currentCursor + 1 : 0
          })
        }
      ]
    ]

    if (shouldEdit) {
      await telegramHook.getWebhook.editMessageText(message, {
        chat_id: msg.chat.id,
        message_id: msg.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      })
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      })
    }
  },
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
    userId: number,
    accountID: string,
    telegramId: number,
    firstName: string,
    dealCount: number,
    tradeVolume: number,
    cryptoCurrencyCode: CryptoCurrency,
    rating: number,
    reviewCount: number
    // isUserBlocked: boolean
  ) {
    // TODO: Add block and sendMessage
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.dealer-account`, {
        accountId: accountID,
        telegramUserId: telegramId,
        firstName: firstName,
        dealCount: dealCount,
        tradeVolume: dataFormatter.formatCryptoCurrency(tradeVolume),
        cryptoCurrencyCode: cryptoCurrencyCode,
        rating: rating.toFixed(1)
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
                  AccountHomeStateKey.cb_showReviews,
                  AccountHomeState[AccountHomeStateKey.cb_showReviews]
                >(AccountHomeStateKey.cb_showReviews, {
                  accountId: accountID
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Account}:home.send-message-cbbutton`),
                callback_data: stringifyCallbackQuery<
                  AccountHomeStateKey.cb_sendMessage,
                  AccountHomeState[AccountHomeStateKey.cb_sendMessage]
                >(AccountHomeStateKey.cb_sendMessage, {
                  toUserId: userId,
                  tradeId: null
                })
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
    rating: string,
    referralCount: number,
    earnings: number,
    addedPaymentMethods: PaymentMethodFields[]
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
            data: null
          })
        },
        {
          text: user.t(`${Namespace.Account}:home.settings-cbbutton`),
          callback_data: stringifyCallbackQuery<
            SettingsStateKey.cb_settings,
            SettingsState[SettingsStateKey.cb_settings]
          >(SettingsStateKey.cb_settings, {
            isFromBack: false,
            data: null
          })
        }
      ]
    ]

    !user.isVerified &&
      inline[0].push({
        text: user.t(`${Namespace.Account}:home.verify-account-cbbutton`),
        url: CONFIG.VERIFY_IDENTITY_URL
      })

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:home.account`, {
        accountID: accountId,
        dealCount: totalDeals,
        tradeVolume: dataFormatter.formatCryptoCurrency(
          tradeVolume,
          cryptoCode
        ),
        cryptoCurrencyCode: cryptoCode,
        rating: rating,
        referralCount: referralCount,
        earnings: dataFormatter.formatCryptoCurrency(earnings, cryptoCode),
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
  paymentMethods: PaymentMethodFields[],
  user: User
) => {
  if (paymentMethods.length === 0) {
    return user.t(`${Namespace.Account}:home.no-payment-method`)
  }
  let pmStringified = '\n       '
  paymentMethods.forEach((pm, index) => {
    pmStringified =
      pmStringified +
      user.t(`payment-methods.names.${pm.paymentMethod}`) +
      `- ${pm.fields[PaymentMethodPrimaryFieldIndex[pm.paymentMethod]]}`

    if (index < paymentMethods.length - 1) {
      pmStringified = pmStringified + '\n       '
    } else {
      pmStringified = pmStringified + ' '
    }
  })
  return pmStringified
}
