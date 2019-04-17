import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { User } from 'models'
import {
  WalletState,
  WalletStateKey,
  SendCoinError,
  WithdrawCoinError
} from './WalletState'
import {
  CryptoCurrency,
  FiatCurrency,
  cryptoCurrencyInfo
} from 'constants/currencies'
import logger from 'modules/Logger'
import { keyboardMainMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'
import { CONFIG } from '../../config'
import * as _ from 'lodash'

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
  switch (currentState.currentStateKey) {
    case WalletStateKey.wallet: {
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
                    WalletStateKey.sendCoin,
                    WalletState[WalletStateKey.sendCoin]
                  >(WalletStateKey.sendCoin, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CRYPTOCURRENCY
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    WalletStateKey.depositCoin,
                    WalletState[WalletStateKey.depositCoin]
                  >(WalletStateKey.depositCoin, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CRYPTOCURRENCY
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    WalletStateKey.withdrawCoin,
                    WalletState[WalletStateKey.withdrawCoin]
                  >(WalletStateKey.withdrawCoin, {
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
    }

    // Send Coin
    case WalletStateKey.sendCoin_amount: {
      const sendCoinState = currentState[WalletStateKey.sendCoin]
      if (!sendCoinState) {
        return false
      }

      const cryptoCurrencyCode = sendCoinState.currencyCode
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
    }

    case WalletStateKey.sendCoin_confirm: {
      const sendCoinAmountState = currentState[WalletStateKey.sendCoin_amount]
      if (!sendCoinAmountState || !sendCoinAmountState.data) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            sendCoinAmountState.data.cryptoCurrencyAmount,
            sendCoinAmountState.data.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            sendCoinAmountState.data.fiatValue,
            sendCoinAmountState.data.fiatCurrency
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
    }

    case WalletStateKey.sendCoin_error: {
      if (!currentState.previousStateKey) {
        return false
      }

      const errorType: SendCoinError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )
      if (!errorType) {
        return false
      }

      switch (errorType) {
        case SendCoinError.INSUFFICIENT_BALANCE: {
          const sendCoinState = currentState[WalletStateKey.sendCoin]
          if (!sendCoinState) {
            return false
          }

          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(
              `${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`,
              {
                cryptoCurrencyCode: sendCoinState.currencyCode,
                cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
                  getWalletBalance(sendCoinState.currencyCode),
                  sendCoinState.currencyCode
                )
              }
            ),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
        }

        default:
          logger.error(
            `alletResponder: ${WalletStateKey.sendCoin_error} -> 'default'`
          )
          return false
      }
    }

    case WalletStateKey.sendCoin_show: {
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
    }

    // Deposit Coin
    case WalletStateKey.depositCoin_show: {
      const addressState = currentState[WalletStateKey.depositCoin_show]
      if (!addressState) {
        return false
      }

      const currencyCode = addressState.currencyCode
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
        `*${addressState.address}*`,
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true
    }

    // Withdraw coin

    case WalletStateKey.withdrawCoin_amount: {
      const withdrawParamsState = currentState[WalletStateKey.withdrawCoin]
      if (!withdrawParamsState) {
        return false
      }

      const cryptoCurrencyCode = withdrawParamsState.currencyCode
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-amount`, {
          cryptoCurrencyCode: cryptoCurrencyCode,
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
    }

    case WalletStateKey.withdrawCoin_address: {
      const withdrawState = currentState[WalletStateKey.withdrawCoin]
      if (!withdrawState) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-address`, {
          cryptoCurrencyName: user.t(
            `cryptocurrency-names.${withdrawState.currencyCode}`
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      return true
    }

    case WalletStateKey.withdrawCoin_error: {
      if (!currentState.previousStateKey) {
        return false
      }

      const errorType: WithdrawCoinError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )
      if (!errorType) {
        return false
      }

      switch (errorType) {
        case WithdrawCoinError.INVALID_ADDRESS: {
          const withdrawState = currentState[WalletStateKey.withdrawCoin]
          if (!withdrawState) {
            return false
          }
          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(
              `${
                Namespace.Wallet
              }:withdraw-cryptocurrency-insufficient-balance`,
              {
                cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
                  getWalletBalance(withdrawState.currencyCode),
                  withdrawState.currencyCode
                )
              }
            ),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
        }

        case WithdrawCoinError.INSUFFICIENT_BALANCE: {
          const withdrawState = currentState[WalletStateKey.withdrawCoin]
          if (!withdrawState) {
            return false
          }

          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(
              `${Namespace.Wallet}:withdraw-cryptocurrency-invalid-address`,
              {
                cryptoCurrencyName: user.t(
                  `cryptocurrency-names.${withdrawState.currencyCode}`
                )
              }
            ),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
        }

        case WithdrawCoinError.CREATE_ERROR: {
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
        }
      }

      return false
    }

    case WalletStateKey.withdrawCoin_confirm: {
      const amountState = _.get(
        currentState[WalletStateKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WalletStateKey.withdrawCoin_address],
        'data',
        null
      )
      if (!amountState || !addressState) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-withdraw-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            amountState.cryptoCurrencyAmount,
            amountState.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            amountState.fiatValue,
            amountState.fiatCurrency
          ),
          toAddress: addressState
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
    }

    case WalletStateKey.withdrawCoin_show: {
      const amountState = _.get(
        currentState[WalletStateKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WalletStateKey.withdrawCoin_address],
        'data',
        null
      )
      if (!amountState || !addressState) {
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
    }

    default:
      logger.error(
        `Unhandled at walletResponder ${JSON.stringify(currentState)}`
      )
      return false
  }
}
