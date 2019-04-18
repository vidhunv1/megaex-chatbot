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
import { cryptoCurrencyInfo } from 'constants/currencies'
import logger from 'modules/Logger'
import { keyboardMainMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'
import { CONFIG } from '../../config'
import * as _ from 'lodash'

export async function walletResponder(
  msg: TelegramBot.Message,
  user: User,
  currentState: WalletState
): Promise<boolean> {
  switch (currentState.currentStateKey) {
    case WalletStateKey.wallet: {
      const walletData = _.get(
        currentState[WalletStateKey.wallet],
        'data',
        null
      )
      if (!walletData) {
        return false
      }
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:wallet-home`, {
          fiatBalance: dataFormatter.formatFiatCurrency(
            walletData.fiatValue,
            walletData.fiatCurrencyCode
          ),
          cryptoBalance: dataFormatter.formatCryptoCurrency(
            walletData.cryptoBalance,
            walletData.cryptoCurrencyCode
          ),
          blockedBalance: dataFormatter.formatCryptoCurrency(
            walletData.blockedBalance,
            walletData.cryptoCurrencyCode
          ),
          referralCount: walletData.referralCount,
          earnings: dataFormatter.formatCryptoCurrency(
            walletData.earnings,
            walletData.cryptoCurrencyCode
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
                      `cryptocurrency-names.${walletData.cryptoCurrencyCode}`
                    )
                  }),
                  callback_data: stringifyCallbackQuery<
                    WalletStateKey.cb_sendCoin,
                    WalletState[WalletStateKey.cb_sendCoin]
                  >(WalletStateKey.cb_sendCoin, {
                    messageId: msg.message_id,
                    currencyCode: walletData.cryptoCurrencyCode,
                    data: null
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    WalletStateKey.cb_depositCoin,
                    WalletState[WalletStateKey.cb_depositCoin]
                  >(WalletStateKey.cb_depositCoin, {
                    messageId: msg.message_id,
                    currencyCode: walletData.cryptoCurrencyCode
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    WalletStateKey.cb_withdrawCoin,
                    WalletState[WalletStateKey.cb_withdrawCoin]
                  >(WalletStateKey.cb_withdrawCoin, {
                    messageId: msg.message_id,
                    currencyCode: walletData.cryptoCurrencyCode,
                    data: null
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
      const sendCoinState = _.get(
        currentState[WalletStateKey.cb_sendCoin],
        'data',
        null
      )
      const cryptoCurrencyCode = _.get(
        currentState[WalletStateKey.cb_sendCoin],
        'currencyCode',
        null
      )
      if (!sendCoinState || !cryptoCurrencyCode) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-amount`, {
          cryptoCurrencyCode: cryptoCurrencyCode,
          fiatCurrencyCode: user.currencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            sendCoinState.cryptoBalance,
            cryptoCurrencyCode
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            sendCoinState.fiatValue,
            sendCoinState.fiatCurrencyCode
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
          const sendCoinState = currentState[WalletStateKey.cb_sendCoin]
          if (!sendCoinState || !sendCoinState.data) {
            return false
          }

          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(
              `${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`,
              {
                cryptoCurrencyCode: sendCoinState.currencyCode,
                cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
                  sendCoinState.data.cryptoBalance,
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

        case SendCoinError.INVALID_AMOUNT: {
          const sendCoinState = currentState[WalletStateKey.cb_sendCoin]
          if (!sendCoinState) {
            return false
          }

          await telegramHook.getWebhook.sendMessage(
            msg.chat.id,
            user.t(`${Namespace.Wallet}:send-cryptocurrency-invalid-amount`),
            {
              parse_mode: 'Markdown',
              reply_markup: keyboardMainMenu(user)
            }
          )
          return true
        }

        default:
          logger.error(
            `walletResponder: ${WalletStateKey.sendCoin_error} -> 'default'`
          )
          return false
      }
    }

    case WalletStateKey.sendCoin_show: {
      const createdPayment = _.get(
        currentState[WalletStateKey.sendCoin_confirm],
        'data',
        null
      )
      if (!createdPayment) {
        return false
      }
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:show-payment-link`, {
          paymentLink: createdPayment.paymentLink,
          expiryTime: `${createdPayment.expiryTimeS / 360} hours`
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
      const withdrawCoinState = _.get(
        currentState[WalletStateKey.cb_withdrawCoin],
        'data',
        null
      )
      const cryptoCurrencyCode = _.get(
        currentState[WalletStateKey.cb_withdrawCoin],
        'currencyCode',
        null
      )
      if (!cryptoCurrencyCode || !withdrawCoinState) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:withdraw-cryptocurrency-amount`, {
          cryptoCurrencyCode: cryptoCurrencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            withdrawCoinState.cryptoBalance,
            cryptoCurrencyCode
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            withdrawCoinState.fiatValue,
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
      const withdrawState = currentState[WalletStateKey.cb_withdrawCoin]
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
      const errorType: WithdrawCoinError | null = _.get(
        currentState,
        `${currentState.previousStateKey}.error`,
        null
      )
      if (!errorType) {
        return false
      }

      switch (errorType) {
        case WithdrawCoinError.INSUFFICIENT_BALANCE: {
          const withdrawCoinState = _.get(
            currentState[WalletStateKey.cb_withdrawCoin],
            'data',
            null
          )
          const cryptoCurrencyCode = _.get(
            currentState[WalletStateKey.cb_withdrawCoin],
            'currencyCode',
            null
          )
          if (!withdrawCoinState || !cryptoCurrencyCode) {
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
                  withdrawCoinState.cryptoBalance,
                  cryptoCurrencyCode
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

        case WithdrawCoinError.INVALID_ADDRESS: {
          const withdrawState = currentState[WalletStateKey.cb_withdrawCoin]
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
          toAddress: addressState.address
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
