import * as TelegramBot from 'node-telegram-bot-api'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { User, Transaction, TransactionSource } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import { stringifyCallbackQuery } from 'chats/utils'
import { SendCoinStateKey, SendCoinState } from '../sendCoin'
import { DepositStateKey, DepositState } from '../deposit'
import { WithdrawStateKey, WithdrawState } from '../withdraw'
import { centerJustify, keyboardMainMenu } from 'chats/common'
import logger from 'modules/logger'

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

  async listTransactions(transactions: Transaction[]) {
    const transactionString = transactions.reduce((acc, current) => {
      let txSourceString = ''

      switch (current.transactionSource) {
        case TransactionSource.CORE: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.core`
          )
          break
        }
        case TransactionSource.PAYMENT: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.payment`
          )
          break
        }
        case TransactionSource.WITHDRAWAL: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.withdrawal`
          )
          break
        }
        case TransactionSource.RELEASE: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.release`
          )
          break
        }
        case TransactionSource.BLOCK: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.block`
          )
          break
        }
        case TransactionSource.TRADE: {
          txSourceString = user.t(
            `${Namespace.Wallet}:transaction.source-name.trade`
          )
          break
        }
        default: {
          logger.error('Unhandled locale key for ' + current.transactionSource)
        }
      }

      const formattedAmount =
        current.amount > 0
          ? '(+) ' + dataFormatter.formatCryptoCurrency(current.amount)
          : '(-) ' + dataFormatter.formatCryptoCurrency(current.amount * -1)
      return (
        acc +
        '\n' +
        user.t('transaction-row', {
          cryptoCurrency: centerJustify(current.currencyCode, 5),
          amount: formattedAmount,
          transactionType: txSourceString
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
