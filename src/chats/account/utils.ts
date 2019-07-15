import { CryptoCurrency } from 'constants/currencies'
import { TelegramAccount, User, Trade } from 'models'
import { AccountHomeMessage, AccountHomeError } from './home'
import * as TelegramBot from 'node-telegram-bot-api'

const CURRENT_CRYPTOCURRENCYC_CODE = CryptoCurrency.BTC

export async function showUserAccount(
  msg: TelegramBot.Message,
  user: User,
  accountId: string
) {
  const accountInfo = await getAccount(accountId)
  if (accountInfo != null) {
    await AccountHomeMessage(msg, user).showDealerAccount(
      accountInfo.userId,
      accountInfo.accountId,
      accountInfo.telegramId,
      accountInfo.firstName,
      accountInfo.dealCount,
      accountInfo.tradeVolume,
      accountInfo.cryptoCurrencyCode,
      accountInfo.rating,
      accountInfo.reviewCount
      // accountInfo.isUserBlocked
    )
  } else {
    await AccountHomeMessage(msg, user).showError(
      AccountHomeError.ACCOUNT_NOT_FOUND
    )
  }
}

async function getAccount(
  accountId: string
): Promise<{
  userId: number
  accountId: string
  telegramUsername: string
  firstName: string
  telegramId: number
  dealCount: number
  tradeVolume: number
  cryptoCurrencyCode: CryptoCurrency
  reviewCount: number
  // isUserBlocked: boolean,
  rating: number
} | null> {
  const user = await User.findOne({
    where: {
      accountId: accountId
    },
    include: [{ model: TelegramAccount }]
  })
  if (!user) {
    return null
  }

  const userStats = await Trade.getUserStats(
    user.id,
    CURRENT_CRYPTOCURRENCYC_CODE
  )
  return {
    userId: user.id,
    accountId,
    telegramUsername: user.telegramUser.username,
    firstName: user.telegramUser.firstName,
    telegramId: user.telegramUser.id,
    dealCount: userStats.dealCount,
    tradeVolume: userStats.volume,
    rating: userStats.rating,
    cryptoCurrencyCode: CURRENT_CRYPTOCURRENCYC_CODE,
    reviewCount: (await Trade.getUserReviews(user.id)).length
    // isUserBlocked: false,
  }
}
