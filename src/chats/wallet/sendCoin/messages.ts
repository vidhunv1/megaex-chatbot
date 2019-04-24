import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'

export const SendCoinMessage = (msg: TelegramBot.Message, user: User) => ({
  askCryptocurrencyAmount: async (
    cryptocurrencyCode: CryptoCurrency,
    cryptoBalance: number,
    fiatCurrencyCode: FiatCurrency,
    fiatValue: number
  ) => {
    const formattedCryptoBalance = dataFormatter.formatCryptoCurrency(
      cryptoBalance,
      cryptocurrencyCode
    )
    const formattedFiatValue = dataFormatter.formatFiatCurrency(
      fiatValue,
      fiatCurrencyCode
    )

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-coin.input-amount`, {
        cryptoCurrencyCode: cryptocurrencyCode,
        fiatCurrencyCode: fiatCurrencyCode,
        cryptoCurrencyBalance: formattedCryptoBalance,
        fiatValue: formattedFiatValue
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

  sendCoinConfirm: async (
    cryptocurrencyCode: CryptoCurrency,
    cryptoAmount: number,
    fiatCurrencyCode: FiatCurrency,
    fiatValue: number
  ) => {
    const formattedCryptoAmount = dataFormatter.formatCryptoCurrency(
      cryptoAmount,
      cryptocurrencyCode
    )
    const formattedFiatValue = dataFormatter.formatFiatCurrency(
      fiatValue,
      fiatCurrencyCode
    )

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-coin.confirm`, {
        cryptoCurrencyAmount: formattedCryptoAmount,
        fiatValue: formattedFiatValue
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t(`${Namespace.Wallet}:send-coin.confirm-button`)
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

  errorInsufficientBalance: async (
    cryptocurrencyCode: CryptoCurrency,
    cryptoBalance: number
  ) => {
    const formattedCryptoBalance = dataFormatter.formatCryptoCurrency(
      cryptoBalance,
      cryptocurrencyCode
    )
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-coin.insufficient-balance`, {
        cryptoCurrencyCode: cryptocurrencyCode,
        cryptoCurrencyBalance: formattedCryptoBalance
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  errorInvalidAmount: async () => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-coin.invalid-amount`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  showCreated: async (paymentLink: string, expiryTimeS: number) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-coin.show-created-link`, {
        paymentLink: paymentLink,
        expiryTime: expiryTimeS / 360
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user),
        disable_web_page_preview: true
      }
    )
  }
})
