import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { CallbackTypes, CallbackParams } from './constants'
import { User } from 'models'
import { WalletState } from './WalletState'
import {
  CryptoCurrency,
  FiatCurrency,
  cryptoCurrencyInfo
} from 'constants/currencies'
import logger from 'modules/Logger'
import { keyboardMainMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'

// TODO: Implement these functions
const getFiatValue = (
  amount: number,
  _fromCurrency: CryptoCurrency,
  _toCurrency: FiatCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount * 300000
}

const getWalletBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.2
}

const getBlockedBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.01
}

const getEarnings = () => {
  logger.error('TODO: Not implemented getEarnings WalletChat#25')
  return 0.1
}

const getReferralCount = () => {
  logger.error('TODO: Not implemented getReferralCount WalletChat#25')
  return 100
}

const getPaymentLink = () => {
  logger.error('TODO: Not implemented getPaymentLink WalletChat#25')
  return 'https://t.me/megadealsbot?start=saddawq213123'
}

const getExpiryTime = () => {
  return '6 hours'
}

const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

export async function walletResponder(
  msg: TelegramBot.Message,
  user: User,
  nextState: WalletState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'wallet':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:wallet-home`, {
          fiatBalance: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(CURRENT_CRYPTOCURRENCY),
              CURRENT_CRYPTOCURRENCY,
              user.currencyCode
            ),
            user.currencyCode
          ),
          cryptoBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          blockedBalance: dataFormatter.formatCryptoCurrency(
            getBlockedBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          referralCount: getReferralCount(),
          earnings: dataFormatter.formatCryptoCurrency(
            getEarnings(),
            CURRENT_CRYPTOCURRENCY
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Wallet}:send-cryptocurrency`, {
                    cryptoCurrencyName: user.t(
                      `cryptocurrency-names.${CURRENT_CRYPTOCURRENCY}`
                    )
                  }),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.SEND_CURRENCY,
                    CallbackParams[CallbackTypes.SEND_CURRENCY]
                  >(CallbackTypes.SEND_CURRENCY, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CRYPTOCURRENCY
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.DEPOSIT,
                    CallbackParams[CallbackTypes.DEPOSIT]
                  >(CallbackTypes.DEPOSIT, {
                    messageId: msg.message_id
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.WITHDRAW,
                    CallbackParams[CallbackTypes.WITHDRAW]
                  >(CallbackTypes.WITHDRAW, {
                    messageId: msg.message_id
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    case 'sendCoinAmount':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-amount`, {
          cryptoCurrencyCode: CURRENT_CRYPTOCURRENCY,
          fiatCurrencyCode: user.currencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(CURRENT_CRYPTOCURRENCY),
              CURRENT_CRYPTOCURRENCY,
              user.currencyCode
            ),
            user.currencyCode
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [
                {
                  text: user.t('actions.cancel-keyboard-button')
                }
              ]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'paymentLinkConfirm':
      if (!nextState.sendCoinAmount) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            nextState.sendCoinAmount.cryptoCurrencyAmount,
            nextState.sendCoinAmount.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            nextState.sendCoinAmount.fiatValue,
            nextState.sendCoinAmount.fiatCurrency
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [
                {
                  text: user.t(
                    `${Namespace.Wallet}:confirm-send-cryptocurrency-button`
                  )
                }
              ],
              [
                {
                  text: user.t('actions.cancel-keyboard-button')
                }
              ]
            ],
            // TODO: some telegram issue, keyboard comes up if set to true ... ??
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'insufficientSendAmount':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`, {
          cryptoCurrencyCode: CURRENT_CRYPTOCURRENCY,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'paymentLink':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:show-payment-link`, {
          paymentLink: getPaymentLink(),
          expiryTime: getExpiryTime()
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user),
          disable_web_page_preview: true
        }
      )
      return true

    case 'deposit':
      return true

    case 'widthdraw':
      return true

    default:
      return false
  }
}
