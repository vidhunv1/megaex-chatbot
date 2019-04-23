import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency } from 'constants/currencies'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'

export const SendCoinMessage = (msg: TelegramBot.Message, user: User) => ({
  askCryptocurrencyAmount: async (
    cryptocurrencyCode: CryptoCurrency,
    formattedCryptoBalance: string,
    formattedFiatBalance: string
  ) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-cryptocurrency-amount`, {
        cryptoCurrencyCode: cryptocurrencyCode,
        fiatCurrencyCode: user.currencyCode,
        cryptoCurrencyBalance: formattedCryptoBalance,
        fiatValue: formattedFiatBalance
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
    formattedCryptoAmount: string,
    formattedFiatValue: string
  ) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency`, {
        cryptoCurrencyAmount: formattedCryptoAmount,
        fiatValue: formattedFiatValue
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
  },

  errorInsufficientBalance: async (
    cryptocurrencyCode: CryptoCurrency,
    formattedCryptobalance: string
  ) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`, {
        cryptoCurrencyCode: cryptocurrencyCode,
        cryptoCurrencyBalance: formattedCryptobalance
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
      user.t(`${Namespace.Wallet}:send-cryptocurrency-invalid-amount`),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  },

  showCreated: async (paymentLink: string, expiryTimeS: number) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:show-payment-link`, {
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
