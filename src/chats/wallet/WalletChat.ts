import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount } from 'models'
import { ChatHandler } from 'chats/types'
import {
  WALLET_STATE_KEY,
  WalletState,
  initialState,
  nextWalletState
} from './WalletState'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/i18n'
import { stringifyCallbackQuery, parseCallbackQuery } from 'chats/utils'
import { CallbackTypes, CallbackParams, callbackStateMap } from './constants'
import { CryptoCurrency, FiatCurrency } from 'constants/currencies'
import { parseCurrencyAmount } from './utils'
import logger from 'modules/Logger'
import { defaultKeyboardMenu } from 'chats/common'
import { dataFormatter } from 'utils/dataFormatter'

// TODO: Implement these functions
const getCryptoValue = (
  amount: number,
  _fromCurrency: FiatCurrency,
  _toCurrency: CryptoCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount / 300000
}

const getFiatValue = (
  amount: number,
  _fromCurrency: CryptoCurrency,
  _toCurrency: FiatCurrency
) => {
  logger.error('TODO: Not implemented getCryptoValue WalletChat#20')
  return amount * 300000
}

const getWalletBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.2
}

const getBlockedBalance = (_cryptoCurrency: CryptoCurrency) => {
  logger.error('TODO: Not implemented getWalletBalance WalletChat#25')
  return 0.01
}

const getEarnings = () => {
  logger.error('TODO: Not implemented getEarnings WalletChat#25')
  return 0.1
}

const getReferralCount = () => {
  logger.error('TODO: Not implemented getReferralCount WalletChat#25')
  return 100
}

const getPaymentLink = () => {
  logger.error('TODO: Not implemented getPaymentLink WalletChat#25')
  return 'https://t.me/megadealsbot?start=saddawq213123'
}

const getExpiryTime = () => {
  return '6 hours'
}

const CURRENT_CRYPTOCURRENCY = CryptoCurrency.BTC

export const WalletChat: ChatHandler = {
  async handleCommand(
    _msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount
  ) {
    return false
  },

  async handleCallback(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery,
    state: WalletState | null
  ) {
    if (callback.data && state) {
      const { type, params } = parseCallbackQuery<CallbackTypes>(callback.data)

      const callbackState = callbackStateMap[type]
      state.currentMessageKey = callbackState
      state[callbackState] = params

      const nextState: WalletState | null = await parseInput(
        msg,
        tUser.id,
        user,
        state
      )

      if (nextState === null) {
        return false
      }

      return await sendResponse(msg, user, nextState)
    }
    return false
  },

  async handleContext(
    msg: TelegramBot.Message,
    user: User,
    tUser: TelegramAccount,
    state: WalletState | null
  ) {
    let currentState = state
    if (msg.text === user.t('main-menu.wallet')) {
      currentState = initialState
    }

    if (currentState && currentState.key === WALLET_STATE_KEY) {
      const nextState: WalletState | null = await parseInput(
        msg,
        tUser.id,
        user,
        currentState
      )

      if (nextState === null) {
        return false
      }

      return sendResponse(msg, user, nextState)
    } else {
      return false
    }
  }
}

async function parseInput(
  msg: TelegramBot.Message,
  telegramId: number,
  user: User,
  currentState: WalletState
): Promise<WalletState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      return await nextWalletState(currentState, telegramId)
    case 'sendCoin':
      return await nextWalletState(currentState, telegramId)
    case 'sendCoinAmount':
      if (msg.text && currentState.sendCoin) {
        const cryptocurrencyCode = currentState.sendCoin.currencyCode
        const fiatcurrencyCode = user.currencyCode
        const parsedCurrency = parseCurrencyAmount(msg.text, user.currencyCode)

        if (!parsedCurrency || (parsedCurrency && parsedCurrency.amount <= 0)) {
          // TODO: Have a retry count
          logger.error('TODO: Retry count for errored input')
          return currentState
        }

        const { currencyCode, currencyKind, amount } = parsedCurrency

        let cryptocurrencyValue, fiatValue
        if (currencyKind === 'fiat') {
          cryptocurrencyValue = getCryptoValue(
            amount,
            currencyCode as FiatCurrency,
            cryptocurrencyCode
          )
          fiatValue = amount
        } else if (currencyKind === 'crypto') {
          cryptocurrencyValue = amount
          fiatValue = getFiatValue(amount, cryptocurrencyCode, fiatcurrencyCode)
        } else {
          return null
        }

        if (cryptocurrencyValue <= getWalletBalance(cryptocurrencyCode)) {
          currentState.sendCoinAmount = {
            cryptoCurrencyAmount: cryptocurrencyValue,
            cryptoCurrency: cryptocurrencyCode,
            fiatValue,
            fiatCurrency: fiatcurrencyCode
          }

          return await nextWalletState(
            currentState,
            telegramId,
            'paymentLinkConfirm'
          )
        } else {
          return await nextWalletState(
            currentState,
            telegramId,
            'insufficientSendAmount'
          )
        }
      } else {
        return null
      }
    case 'paymentLinkConfirm':
      if (
        msg.text &&
        currentState.sendCoin &&
        msg.text ===
          user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency-button`)
      ) {
        return await nextWalletState(currentState, telegramId)
      }
      return null
    default:
      return null
  }
}

async function sendResponse(
  msg: TelegramBot.Message,
  user: User,
  nextState: WalletState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'wallet':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:wallet-home`, {
          fiatBalance: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(CURRENT_CRYPTOCURRENCY),
              CURRENT_CRYPTOCURRENCY,
              user.currencyCode
            ),
            user.currencyCode
          ),
          cryptoBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          blockedBalance: dataFormatter.formatCryptoCurrency(
            getBlockedBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          referralCount: getReferralCount(),
          earnings: dataFormatter.formatCryptoCurrency(
            getEarnings(),
            CURRENT_CRYPTOCURRENCY
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.t(`${Namespace.Wallet}:send-cryptocurrency`, {
                    orderCount: 0
                  }),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.SEND_CURRENCY,
                    CallbackParams[CallbackTypes.SEND_CURRENCY]
                  >(CallbackTypes.SEND_CURRENCY, {
                    messageId: msg.message_id,
                    currencyCode: CURRENT_CRYPTOCURRENCY
                  })
                }
              ],
              [
                {
                  text: user.t(`${Namespace.Wallet}:my-address`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.DEPOSIT,
                    CallbackParams[CallbackTypes.DEPOSIT]
                  >(CallbackTypes.DEPOSIT, {
                    messageId: msg.message_id
                  })
                },
                {
                  text: user.t(`${Namespace.Wallet}:withdraw`),
                  callback_data: stringifyCallbackQuery<
                    CallbackTypes.WITHDRAW,
                    CallbackParams[CallbackTypes.WITHDRAW]
                  >(CallbackTypes.WITHDRAW, {
                    messageId: msg.message_id
                  })
                }
              ]
            ]
          }
        }
      )
      return true

    case 'sendCoinAmount':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-amount`, {
          cryptoCurrencyCode: CURRENT_CRYPTOCURRENCY,
          fiatCurrencyCode: user.currencyCode,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            getFiatValue(
              getWalletBalance(CURRENT_CRYPTOCURRENCY),
              CURRENT_CRYPTOCURRENCY,
              user.currencyCode
            ),
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

    case 'paymentLinkConfirm':
      if (!nextState.sendCoinAmount) {
        return false
      }

      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:confirm-send-cryptocurrency`, {
          cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
            nextState.sendCoinAmount.cryptoCurrencyAmount,
            nextState.sendCoinAmount.cryptoCurrency
          ),
          fiatValue: dataFormatter.formatFiatCurrency(
            nextState.sendCoinAmount.fiatValue,
            nextState.sendCoinAmount.fiatCurrency
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
            one_time_keyboard: true,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'insufficientSendAmount':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:send-cryptocurrency-insufficient-balance`, {
          cryptoCurrencyCode: CURRENT_CRYPTOCURRENCY,
          cryptoCurrencyBalance: dataFormatter.formatCryptoCurrency(
            getWalletBalance(CURRENT_CRYPTOCURRENCY),
            CURRENT_CRYPTOCURRENCY
          )
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user)
        }
      )
      return true

    case 'paymentLink':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Wallet}:show-payment-link`, {
          paymentLink: getPaymentLink(),
          expiryTime: getExpiryTime()
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user),
          disable_web_page_preview: true
        }
      )
      return true

    case 'deposit':
      return true

    case 'widthdraw':
      return true

    default:
      return false
  }
}
