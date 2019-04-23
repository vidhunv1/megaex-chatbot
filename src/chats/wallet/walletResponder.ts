import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery } from 'chats/utils'
import { User } from 'models'
import { WalletState, WalletHomeKey, WithdrawCoinError } from './WalletState'
import logger from 'modules/Logger'
import { keyboardMainMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'
import { CONFIG } from '../../config'
import * as _ from 'lodash'
import { DepositStateKey, DepositState, DepositResponder } from './deposit'
import { SendCoinStateKey, SendCoinState } from './sendCoin/types'
import { SendCoinResponder } from './sendCoin/responder'

export async function walletResponder(
  msg: TelegramBot.Message,
  user: User,
  currentState: WalletState
): Promise<boolean> {
  // Deposit
  if (Object.keys(DepositStateKey).includes(currentState.currentStateKey)) {
    return await DepositResponder(msg, user, currentState)[
      currentState.currentStateKey
    ]()
  }

  if (Object.keys(SendCoinStateKey).includes(currentState.currentStateKey)) {
    return await SendCoinResponder(msg, user, currentState)[
      currentState.currentStateKey
    ]()
  }

  switch (currentState.currentStateKey) {
    case WalletHomeKey.wallet: {
      const walletData = _.get(currentState[WalletHomeKey.start], 'data', null)
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
                    SendCoinStateKey.cb_sendCoin,
                    SendCoinState[SendCoinStateKey.cb_sendCoin]
                  >(SendCoinStateKey.cb_sendCoin, {
                    mId: msg.message_id,
                    currencyCode: walletData.cryptoCurrencyCode,
                    data: null
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    DepositStateKey.cb_depositCoin,
                    DepositState[DepositStateKey.cb_depositCoin]
                  >(DepositStateKey.cb_depositCoin, {
                    mId: msg.message_id,
                    currencyCode: walletData.cryptoCurrencyCode
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    WalletHomeKey.cb_withdrawCoin,
                    WalletState[WalletHomeKey.cb_withdrawCoin]
                  >(WalletHomeKey.cb_withdrawCoin, {
                    mId: msg.message_id,
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

    // Withdraw coin

    case WalletHomeKey.withdrawCoin_amount: {
      const withdrawCoinState = _.get(
        currentState[WalletHomeKey.cb_withdrawCoin],
        'data',
        null
      )
      const cryptoCurrencyCode = _.get(
        currentState[WalletHomeKey.cb_withdrawCoin],
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

    case WalletHomeKey.withdrawCoin_address: {
      const withdrawState = currentState[WalletHomeKey.cb_withdrawCoin]
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

    case WalletHomeKey.withdrawCoin_error: {
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
            currentState[WalletHomeKey.cb_withdrawCoin],
            'data',
            null
          )
          const cryptoCurrencyCode = _.get(
            currentState[WalletHomeKey.cb_withdrawCoin],
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
          const withdrawState = currentState[WalletHomeKey.cb_withdrawCoin]
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

    case WalletHomeKey.withdrawCoin_confirm: {
      const amountState = _.get(
        currentState[WalletHomeKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WalletHomeKey.withdrawCoin_address],
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

    case WalletHomeKey.withdrawCoin_show: {
      const amountState = _.get(
        currentState[WalletHomeKey.withdrawCoin_amount],
        'data',
        null
      )
      const addressState = _.get(
        currentState[WalletHomeKey.withdrawCoin_address],
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
