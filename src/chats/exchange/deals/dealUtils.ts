import { Order, Trade } from 'models'
import { DealsStateKey, DealsState } from './types'
import { stringifyCallbackQuery } from 'chats/utils'
import { Namespace } from 'modules/i18n'
import { User } from 'models'
import { TelegramAccount } from 'models'
import logger from 'modules/logger'
import { telegramHook } from 'modules'
import { dataFormatter } from 'utils/dataFormatter'
import { keyboardMainMenu } from 'chats/common'

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
    const order = await Order.getOrder(orderId)
    if (!order) {
      logger.error('deals/parser/initOpenTrade No order found')
      return null
    }

    const telegramAccountOP = await TelegramAccount.findOne({
      where: {
        userId: order.userId
      }
    })
    // send message to OP
    if (!telegramAccountOP) {
      throw new Error('No Telegram account found')
    }

    await telegramHook.getWebhook.sendMessage(
      telegramAccountOP.id,
      order.user.t(`${Namespace.Exchange}:deals.trade.init-get-confirm`, {
        tradeId: trade.id,
        requestorAccountId: openedByUser.accountId,
        cryptoCurrencyAmount: dataFormatter.formatCryptoCurrency(
          cryptoAmount,
          order.cryptoCurrencyCode
        ),
        fiatValue: dataFormatter.formatFiatCurrency(
          fiatAmount,
          order.fiatCurrencyCode
        )
      }),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: order.user.t(
                  `${Namespace.Exchange}:deals.trade.trade-init-yes-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_respondToTradeInit,
                  DealsState[DealsStateKey.cb_respondToTradeInit]
                >(DealsStateKey.cb_respondToTradeInit, {
                  confirmation: 'yes'
                })
              },
              {
                text: order.user.t(
                  `${Namespace.Exchange}:deals.trade.trade-init-no-cbbutton`
                ),
                callback_data: stringifyCallbackQuery<
                  DealsStateKey.cb_respondToTradeInit,
                  DealsState[DealsStateKey.cb_respondToTradeInit]
                >(DealsStateKey.cb_respondToTradeInit, {
                  confirmation: 'no'
                })
              }
            ]
          ]
        }
      }
    )

    return trade
  },

  getOrder: async function(orderId: number) {
    return await Order.getOrder(orderId)
  },

  cancelTrade: async function(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.setCanceled(tradeId)
    if (trade) {
      const opUser = await User.findById(trade.order.userId, {
        include: [{ model: TelegramAccount }]
      })

      if (opUser) {
        await telegramHook.getWebhook.sendMessage(
          opUser.telegramUser.id,
          opUser.t(`${Namespace.Exchange}:deals.trade.cancel-trade-notify`, {
            tradeId: trade.id
          }),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(opUser)
          }
        )
      }
    }

    return trade
  }
}
