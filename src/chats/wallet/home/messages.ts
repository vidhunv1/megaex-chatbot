import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { User } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import { stringifyCallbackQuery } from 'chats/utils'
import { SendCoinStateKey, SendCoinState } from '../sendCoin'
import { DepositStateKey, DepositState } from '../deposit'
import { WithdrawStateKey, WithdrawState } from '../withdraw'
import { centerJustify, keyboardMainMenu } from 'chats/common'
import { TxType } from 'chats/types'

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
      user.t(`${Namespace.Wallet}:home.wallet`, {
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
                text: user.t(
                  `${Namespace.Wallet}:home.send-cryptocurrency-cbbutton`,
                  {
                    cryptoCurrencyName: user.t(
                      `cryptocurrency-names.${cryptocurrencyCode}`
                    )
                  }
                ),
                callback_data: stringifyCallbackQuery<
                  SendCoinStateKey.cb_sendCoin,
                  SendCoinState[SendCoinStateKey.cb_sendCoin]
                >(SendCoinStateKey.cb_sendCoin, {
                  currencyCode: cryptocurrencyCode,
                  data: null
                })
              }
            ],
            [
              {
                text: user.t(`${Namespace.Wallet}:home.my-address`),
                callback_data: stringifyCallbackQuery<
                  DepositStateKey.cb_depositCoin,
                  DepositState[DepositStateKey.cb_depositCoin]
                >(DepositStateKey.cb_depositCoin, {
                  currencyCode: cryptocurrencyCode
                })
              },
              {
                text: user.t(`${Namespace.Wallet}:home.withdraw`),
                callback_data: stringifyCallbackQuery<
                  WithdrawStateKey.cb_withdrawCoin,
                  WithdrawState[WithdrawStateKey.cb_withdrawCoin]
                >(WithdrawStateKey.cb_withdrawCoin, {
                  currencyCode: cryptocurrencyCode,
                  data: null
                })
              }
            ]
          ]
        }
      }
    )
  },

  async listTransactions(
    transactions: {
      date: number
      currencyCode: CryptoCurrency
      txType: TxType
      amount: number
    }[]
  ) {
    const transactionString = transactions.reduce((acc, current) => {
      const txTypeString =
        current.txType === TxType.DEPOSIT ||
        current.txType === TxType.INTERNAL_SEND
          ? user.t(`${Namespace.Wallet}:home.transaction-debit`)
          : user.t(`${Namespace.Wallet}:home.transaction-credit`)

      return (
        acc +
        '\n' +
        user.t('transaction-row', {
          cryptoCurrency: centerJustify(current.currencyCode, 10),
          amount: centerJustify(current.amount, 10),
          transactionType: centerJustify(txTypeString, 10)
        })
      )
    }, '')
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t('show-transactions-title', {
        transactionsData: transactionString
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: keyboardMainMenu(user)
      }
    )
  }
})
