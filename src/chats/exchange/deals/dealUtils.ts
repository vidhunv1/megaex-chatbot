import { Order, Trade } from 'models'
import { Namespace } from 'modules/i18n'
import { User } from 'models'
import { TelegramAccount } from 'models'
import logger from 'modules/logger'
import { telegramHook } from 'modules'
import { dataFormatter } from 'utils/dataFormatter'
import { sendTradeMessage } from './tradeMessage'

export const dealUtils = {
  sendOpenDealRequest: async function(
    orderId: number,
    requesterUser: User,
    requestorTelegram: TelegramAccount,
    dealFiatAmount: number
  ) {
    logger.warn(
      'TODO: Potential area for spamming. deals/parser sendOpenDealRequest'
    )
    const order = await this.getOrder(orderId)

    if (!order) {
      return false
    }

    const op = await User.findById(order.userId, {
      include: [{ model: TelegramAccount }]
    })

    if (!op) {
      return false
    }

    logger.info(
      `deals/parser/sendOpenDealRequest: /O${orderId} requester: ${
        requesterUser.id
      } to user ${order.userId}`
    )

    const dealCryptoAmount: number =
      dealFiatAmount /
      (await Order.convertToFixedRate(
        order.rate,
        order.rateType,
        order.cryptoCurrencyCode,
        order.fiatCurrencyCode,
        order.user.exchangeRateSource
      ))

    await telegramHook.getWebhook.sendMessage(
      op.telegramUser.id,
      op.t(`${Namespace.Exchange}:deals.request-deposit-notify`, {
        orderId: order.id,
        requesterName: requestorTelegram.firstName,
        requesterUsername: requestorTelegram.username,
        formattedFiatValue: dataFormatter.formatFiatCurrency(
          dealFiatAmount,
          order.fiatCurrencyCode
        ),
        formattedCryptoValue: dataFormatter.formatCryptoCurrency(
          dealCryptoAmount,
          order.cryptoCurrencyCode
        )
      }),
      {
        parse_mode: 'Markdown'
      }
    )
    return true
  },

  initOpenTrade: async function(
    orderId: number,
    fiatAmount: number,
    fixedRate: number,
    openedByUser: User
  ): Promise<Trade | null> {
    const cryptoAmount: number = fiatAmount / fixedRate

    const trade = await Trade.initiateTrade(
      openedByUser.id,
      orderId,
      cryptoAmount,
      fixedRate
    )

    const opUser = await User.findById(trade.getOpUserId(), {
      include: [{ model: TelegramAccount }]
    })
    // send message to OP
    if (!opUser) {
      logger.error(
        'dealUtils: initOpenTrade no user found ' + trade.getOpUserId()
      )
      throw new Error('No Telegram account found')
    }

    sendTradeMessage[trade.status](trade, opUser, opUser.telegramUser)
    return trade
  },

  getOrder: async function(orderId: number) {
    return await Order.getOrder(orderId)
  },

  cancelTrade: async function(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.setCanceled(tradeId)
    if (trade) {
      const opUser = await User.findById(trade.getOpUserId(), {
        include: [{ model: TelegramAccount }]
      })

      if (opUser) {
        await sendTradeMessage[trade.status](trade, opUser, opUser.telegramUser)
      }
    }

    return trade
  },
  acceptTrade: async function(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.acceptTrade(tradeId)
    const createdByUser = await User.findById(trade.createdByUserId, {
      include: [{ model: TelegramAccount }]
    })
    if (trade && createdByUser) {
      await sendTradeMessage[trade.status](
        trade,
        createdByUser,
        createdByUser.telegramUser
      )
    } else {
      logger.error('dealUtils/acceptTrade: could not accept trade ' + tradeId)
    }

    return trade
  },
  rejectTrade: async function(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.rejectTrade(tradeId)
    if (trade) {
      const openedByUser = await User.findById(trade.createdByUserId, {
        include: [{ model: TelegramAccount }]
      })

      if (openedByUser) {
        await sendTradeMessage[trade.status](
          trade,
          openedByUser,
          openedByUser.telegramUser
        )
      }
    }

    return trade
  }
}
