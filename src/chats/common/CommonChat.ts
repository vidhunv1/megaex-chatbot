import * as TelegramBot from 'node-telegram-bot-api'
import { User, TelegramAccount, Order, Transaction } from 'models'
import { ChatHandler, BotCommand, DeepLink } from 'chats/types'
import { telegramHook } from 'modules'
import { keyboardMainMenu } from './utils'
import { CacheHelper } from 'lib/CacheHelper'
import { parseCallbackQuery, parseDeepLink } from 'chats/utils'
import { CommonStateKey } from './types'
import { CryptoCurrency } from 'constants/currencies'
import { logger } from 'modules'
import { DealsMessage } from 'chats/exchange/deals'
import * as _ from 'lodash'
import { AccountHomeMessage } from 'chats/account/home'
import { claimCode } from 'chats/wallet/sendCoin'

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
      case BotCommand.START: {
        const deepLinks = parseDeepLink(msg)
        const deeplink = _.get(deepLinks, 'key', null) as DeepLink | null
        const value = _.get(deepLinks, 'value', null)
        if (deeplink == null || value == null) {
          return false
        }

        if (deeplink === DeepLink.ORDER) {
          const orderId = value
          try {
            const { order, dealer } = await getOrder(parseInt(orderId))
            if (order && dealer) {
              const availableBalance = await getAvailableBalance(
                order.userId,
                order.cryptoCurrencyCode
              )
              const availableBalanceInFiat =
                (await Order.convertToFixedRate(
                  order.rate,
                  order.rateType,
                  order.fiatCurrencyCode,
                  user.exchangeRateSource
                )) * availableBalance

              await DealsMessage(msg, user).showDeal(
                order.orderType,
                order.id,
                order.cryptoCurrencyCode,
                dealer.telegramUser.firstName,
                dealer.accountId,
                dealer.lastSeen,
                dealer.rating,
                dealer.tradeCount,
                order.terms,
                order.paymentMethodType,
                await Order.convertToFixedRate(
                  order.rate,
                  order.rateType,
                  order.fiatCurrencyCode,
                  dealer.exchangeRateSource
                ),
                {
                  min: order.minFiatAmount,
                  max: order.maxFiatAmount
                },
                availableBalanceInFiat,
                order.fiatCurrencyCode,
                dealer.reviewCount
              )
            }
          } catch (e) {
            logger.warn('Invalid order id ' + orderId)
          }
          return true
        } else if (deeplink === DeepLink.ACCOUNT) {
          const accountInfo = await getAccount(value)
          if (accountInfo != null) {
            await AccountHomeMessage(msg, user).showDealerAccount(
              accountInfo.accountId,
              accountInfo.telegramUsername,
              accountInfo.dealCount,
              accountInfo.tradeVolume,
              accountInfo.cryptoCurrencyCode,
              accountInfo.tradeSpeed,
              accountInfo.rating,
              accountInfo.reviewCount
              // accountInfo.isUserBlocked
            )
          }

          return true
        } else if (deeplink === DeepLink.PAYMENT) {
          await claimCode(user, tUser, value)
          return true
        }
        return false
      }
      default:
        return false
    }
  },

  async handleCallback(
    msg: TelegramBot.Message,
    _user: User,
    _tUser: TelegramAccount,
    callback: TelegramBot.CallbackQuery
  ) {
    if (callback.data && msg) {
      const { type } = parseCallbackQuery(callback.data)

      const callbackName = type as any
      if (callbackName === CommonStateKey.cb_deleteThisMessage) {
        await telegramHook.getWebhook.deleteMessage(
          msg.chat.id,
          msg.message_id + ''
        )
        return true
      }
    }
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

async function getOrder(orderId: number) {
  logger.error('TODO: CommonChat: Implement user details on getOrder')

  const order = await Order.getOrder(orderId)
  if (!order) {
    return {
      order: null,
      dealer: null
    }
  }

  const dealer = await User.getUser(order.userId)
  if (!dealer) {
    return {
      order: null,
      dealer: null
    }
  }

  return {
    order: order,
    dealer: {
      ...dealer,
      rating: 4.7,
      lastSeen: new Date(),
      tradeCount: 5,
      reviewCount: 30
    }
  }
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}

// TODO: -----------
async function getAccount(
  accountId: string
): Promise<{
  accountId: string
  telegramUsername: string
  dealCount: number
  tradeVolume: number
  cryptoCurrencyCode: CryptoCurrency
  tradeSpeed: number
  reviewCount: number
  // isUserBlocked: boolean,
  rating: number
} | null> {
  logger.error('TODO: CommonChat implement getAccount')
  return {
    accountId,
    telegramUsername: 'satoshi',
    dealCount: 4,
    tradeVolume: 100,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    tradeSpeed: 100,
    reviewCount: 30,
    // isUserBlocked: false,
    rating: 4.5
  }
}
