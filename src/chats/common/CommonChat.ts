import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler, BotCommand } from 'chats/types'
import telegramHook from 'modules/TelegramHook'
import { keyboardMainMenu } from './utils'
import { CacheHelper } from 'lib/CacheHelper'
import { CryptoCurrency } from 'constants/currencies'
import { centerJustify } from './utils'
import { dataFormatter } from 'utils/dataFormatter'

const getTransactions = () => {
  enum TxType {
    WITHDRAWAL = 'WITHDRAWAL',
    DEPOSIT = 'DEPOSIT',
    INTERNAL_SEND = 'INTERNAL_SEND',
    INTERNAL_RECEIVE = 'INTERNAL_RECEIVE'
  }

  const getTypeString = (type: TxType) =>
    type === TxType.DEPOSIT || type === TxType.INTERNAL_SEND
      ? 'debit'
      : 'credit'
  return [
    {
      date: Date.now(),
      currencyCode: CryptoCurrency.BTC,
      txType: getTypeString(TxType.DEPOSIT),
      amount: dataFormatter.formatCryptoCurrency(0.0001)
    },
    {
      date: Date.now(),
      currencyCode: CryptoCurrency.BTC,
      txType: getTypeString(TxType.INTERNAL_SEND),
      amount: dataFormatter.formatCryptoCurrency(0.0002)
    },
    {
      date: Date.now(),
      currencyCode: CryptoCurrency.BTC,
      txType: getTypeString(TxType.INTERNAL_SEND),
      amount: dataFormatter.formatCryptoCurrency(0.0001)
    },
    {
      date: Date.now(),
      currencyCode: CryptoCurrency.BTC,
      txType: getTypeString(TxType.INTERNAL_RECEIVE),
      amount: dataFormatter.formatCryptoCurrency(0.0001)
    },
    {
      date: Date.now(),
      currencyCode: CryptoCurrency.BTC,
      txType: getTypeString(TxType.WITHDRAWAL),
      amount: dataFormatter.formatCryptoCurrency(0.0001)
    }
  ]
}

export const CommonChat: ChatHandler = {
  async handleCommand(
    msg: TelegramBot.Message,
    command: BotCommand,
    user: User,
    tUser: TelegramAccount
  ) {
    switch (command) {
      case BotCommand.CANCEL: {
        await telegramHook.getWebhook.sendMessage(
          msg.chat.id,
          user.t('action-canceled'),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(user)
          }
        )
        await CacheHelper.clearState(tUser.id)
        return true
      }

      case BotCommand.TRANSACTIONS: {
        const transactionString = getTransactions().reduce(
          (acc, current) =>
            acc +
            '\n' +
            user.t('transaction-row', {
              cryptoCurrency: centerJustify(current.currencyCode, 10),
              amount: centerJustify(current.amount, 10),
              transactionType: centerJustify(current.txType, 10)
            }),
          ''
        )
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
        return true
      }
    }
    return false
  },

  async handleCallback(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    _callback: TelegramBot.CallbackQuery
  ) {
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    _state: any
  ) {
    if (
      msg.text === user.t('actions.cancel-keyboard-button') ||
      msg.text === user.t('cancel')
    ) {
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t('action-canceled'),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )
      await CacheHelper.clearState(tUser.id)
      return true
    }
    return false
  }
}
