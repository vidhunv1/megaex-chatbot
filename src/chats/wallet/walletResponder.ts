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
import { CONFIG } from '../../config'

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
  currentState: WalletState
): Promise<boolean> {
  switch (currentState.currentMessageKey) {
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
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CRYPTOCURRENCY
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    case 'sendCoinAmount':
      if (!currentState.sendCoin) {
        return false
      }

      const cryptoCurrencyCode = currentState.sendCoin.currencyCode
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-amount`, {
          cryptoCurrencyCode: cryptoCurrencyCode,
          fiatCurrencyCode: user.currencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(cryptoCurrencyCode),
            cryptoCurrencyCode
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(cryptoCurrencyCode),
              cryptoCurrencyCode,
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
      if (!currentState.sendCoinAmount) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            currentState.sendCoinAmount.cryptoCurrencyAmount,
            currentState.sendCoinAmount.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            currentState.sendCoinAmount.fiatValue,
            currentState.sendCoinAmount.fiatCurrency
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
      if (!currentState.withdraw) {
        return false
      }
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`, {
          cryptoCurrencyCode: currentState.withdraw.currencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(currentState.withdraw.currencyCode),
            currentState.withdraw.currencyCode
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
          reply_markup: keyboardMainMenu(user),
          disable_web_page_preview: true
        }
      )
      return true

    case 'showDepositAddress':
      if (!currentState.showDepositAddress) {
        return false
      }

      const currencyCode = currentState.showDepositAddress.currencyCode
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:show-deposit-address`, {
          cryptoCurrencyCode: currencyCode,
          confirmations: cryptoCurrencyInfo[currencyCode].confirmations
        }),
        {
          parse_mode: 'Markdown'
        }
      )
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        `*${currentState.showDepositAddress.address}*`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'withdrawCoinAmount':
      if (!currentState.withdraw) {
        return false
      }

      const cryptoCurrencyCode1 = currentState.withdraw.currencyCode
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-amount`, {
          cryptoCurrencyCode: cryptoCurrencyCode1,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(cryptoCurrencyCode1),
            cryptoCurrencyCode1
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(cryptoCurrencyCode1),
              cryptoCurrencyCode1,
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

    case 'insufficientWithdrawAmount':
      if (!currentState.withdraw) {
        return false
      }
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(
          `${Namespace.Wallet}:withdraw-cryptocurrency-insufficient-balance`,
          {
            cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
              getWalletBalance(currentState.withdraw.currencyCode),
              currentState.withdraw.currencyCode
            )
          }
        ),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'withdrawAddress':
      if (!currentState.withdraw) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-address`, {
          cryptoCurrencyName: user.t(
            `cryptocurrency-names.${currentState.withdraw.currencyCode}`
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'withdrawConfirm':
      if (!currentState.withdrawCoinAmount || !currentState.withdrawAddress) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-withdraw-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            currentState.withdrawCoinAmount.cryptoCurrencyAmount,
            currentState.withdrawCoinAmount.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            currentState.withdrawCoinAmount.fiatValue,
            currentState.withdrawCoinAmount.fiatCurrency
          ),
          toAddress: currentState.withdrawAddress
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [
              [
                {
                  text: user.t(
                    `${Namespace.Wallet}:confirm-withdraw-cryptocurrency-button`
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

    case 'invalidWithdrawAddress':
      if (!currentState.withdraw) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-invalid-address`, {
          cryptoCurrencyName: user.t(
            `cryptocurrency-names.${currentState.withdraw.currencyCode}`
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'showWithdrawSuccess':
      if (!currentState.withdrawCoinAmount || !currentState.withdrawAddress) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-success`),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    case 'showWithdrawError':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-error`, {
          supportUsername: CONFIG.SUPPORT_USERNAME
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true

    default:
      return false
  }
}
