import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { dataFormatter } from 'utils/dataFormatter'
import { keyboardMainMenu } from 'chats/common'
import { CONFIG } from '../../../config'

export const WithdrawMessage = (msg: TelegramBot.Message, user: User) => ({
  async enterWithdrawAmount(
    currencyCode: CryptoCurrency,
    cryptocurrencyBalance: number,
    fiatValue: number
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.input-amount`, {
        cryptoCurrencyCode: currencyCode,
        cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
          cryptocurrencyBalance,
          currencyCode
        ),
        fiatValue: dataFormatter.formatFiatCurrency(
          fiatValue,
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
  },

  async enterWithdrawAddress(currencyCode: CryptoCurrency) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.input-address`, {
        cryptoCurrencyName: user.t(`cryptocurrency-names.${currencyCode}`)
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
  },

  async errorInsufficientBalance(
    currencyCode: CryptoCurrency,
    cryptobalance: number
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.insufficient-balance`, {
        cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
          cryptobalance,
          currencyCode
        )
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async errorInvalidAddress(currencyCode: CryptoCurrency) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.invalid-address`, {
        cryptoCurrencyName: user.t(`cryptocurrency-names.${currencyCode}`)
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async errorCreateWithdraw() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.create-error`, {
        supportUsername: CONFIG.SUPPORT_USERNAME
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  async confirmWithdraw(
    cryptoCurrency: CryptoCurrency,
    cryptoAmount: number,
    fiatcurrency: FiatCurrency,
    fiatValue: number,
    toAddress: string
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.confirm`, {
        cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
          cryptoAmount,
          cryptoCurrency
        ),
        fiatValue: dataFormatter.formatFiatCurrency(fiatValue, fiatcurrency),
        toAddress: toAddress
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t(`${Namespace.Wallet}:withdraw.confirm-button`)
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
  },

  async showCreatedWithdrawalSuccess() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:withdraw.create-success`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  }
})
