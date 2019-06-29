import { Order, User, Trade, Transaction } from 'models'
import { CryptoCurrency } from 'constants/currencies'
import * as TelegramBot from 'node-telegram-bot-api'
import { DealsMessage } from './messages'

export async function showOrder(
  msg: TelegramBot.Message,
  user: User,
  orderId: number
) {
  const { order, dealer } = await getOrderInfo(orderId)
  if (order != null && dealer != null) {
    const trueRate: number = await Order.convertToFixedRate(
      order.rate,
      order.rateType,
      order.cryptoCurrencyCode,
      order.fiatCurrencyCode,
      order.user.exchangeRateSource
    )

    const availableBalance = await getAvailableBalance(
      order.userId,
      order.cryptoCurrencyCode
    )
    const availableBalanceInFiat =
      (await Order.convertToFixedRate(
        order.rate,
        order.rateType,
        order.cryptoCurrencyCode,
        order.fiatCurrencyCode,
        order.user.exchangeRateSource
      )) * availableBalance
    await DealsMessage(msg, user).showOrderDeal(
      order.orderType,
      order.id,
      order.cryptoCurrencyCode,
      dealer.telegramUser.firstName,
      dealer.accountId,
      dealer.isVerified,
      dealer.lastSeen,
      dealer.rating,
      dealer.tradeCount,
      order.terms,
      order.paymentMethodType,
      trueRate,
      {
        min: order.minFiatAmount,
        max: order.maxFiatAmount
      },
      availableBalanceInFiat,
      order.fiatCurrencyCode,
      dealer.reviewCount
    )
  }
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}

export async function getOrderInfo(orderId: number) {
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

  const userStats = await Trade.getUserStats(
    order.userId,
    order.cryptoCurrencyCode
  )

  return {
    order: order,
    dealer: {
      ...dealer,
      rating: userStats.rating,
      lastSeen: new Date(),
      tradeCount: userStats.dealCount,
      reviewCount: await Trade.getUserReviews(order.userId)
    }
  }
}
