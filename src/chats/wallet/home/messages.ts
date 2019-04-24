import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { User } from 'models'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import { stringifyCallbackQuery } from 'chats/utils'
import { SendCoinStateKey, SendCoinState } from '../sendCoin'
import { DepositStateKey, DepositState } from '../deposit'
import { WithdrawStateKey, WithdrawState } from '../withdraw'

export const WalletHomeMessage = (msg: TelegramBot.Message, user: User) => ({
  showWalletHome: async (
    cryptocurrencyCode: CryptoCurrency,
    cryptoBalance: number,
    fiatCurrencyCode: FiatCurrency,
    fiatValue: number,
    blockedBalance: number,
    earnings: number,
    referralCount: number
  ) => {
    const formattedFiatBalance = dataFormatter.formatFiatCurrency(
      fiatValue,
      fiatCurrencyCode
    )
    const formattedCryptoBalance = dataFormatter.formatCryptoCurrency(
      cryptoBalance,
      cryptocurrencyCode
    )
    const formattedBlockedBalance = dataFormatter.formatCryptoCurrency(
      blockedBalance,
      cryptocurrencyCode
    )
    const formattedEarnings = dataFormatter.formatCryptoCurrency(
      earnings,
      cryptocurrencyCode
    )

    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Wallet}:wallet-home`, {
        fiatBalance: formattedFiatBalance,
        cryptoBalance: formattedCryptoBalance,
        blockedBalance: formattedBlockedBalance,
        referralCount: referralCount,
        earnings: formattedEarnings
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.t(`${Namespace.Wallet}:send-cryptocurrency`, {
                  cryptoCurrencyName: user.t(
                    `cryptocurrency-names.${cryptocurrencyCode}`
                  )
                }),
                callback_data: stringifyCallbackQuery<
                  SendCoinStateKey.cb_sendCoin,
                  SendCoinState[SendCoinStateKey.cb_sendCoin]
                >(SendCoinStateKey.cb_sendCoin, {
                  mId: msg.message_id,
                  currencyCode: cryptocurrencyCode,
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
                  currencyCode: cryptocurrencyCode
                })
              },
              {
                text: user.t(`${Namespace.Wallet}:withdraw`),
                callback_data: stringifyCallbackQuery<
                  WithdrawStateKey.cb_withdrawCoin,
                  WithdrawState[WithdrawStateKey.cb_withdrawCoin]
                >(WithdrawStateKey.cb_withdrawCoin, {
                  mId: msg.message_id,
                  currencyCode: cryptocurrencyCode,
                  data: null
                })
              }
            ]
          ]
        }
      }
    )
  }
})
