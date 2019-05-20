import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency, cryptoCurrencyInfo } from 'constants/currencies'
import { User } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { keyboardMainMenu } from 'chats/common'

export const DepositMessage = (msg: TelegramBot.Message, user: User) => ({
  showDepositAddress: async (
    depositAddress: string,
    currencyCode: CryptoCurrency
  ) => {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:deposit.show-address`, {
        cryptoCurrencyCode: currencyCode,
        confirmations: cryptoCurrencyInfo[currencyCode].confirmations
      }),
      {
        parse_mode: 'Markdown'
      }
    )
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      `*${depositAddress}*`,
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  }
})
