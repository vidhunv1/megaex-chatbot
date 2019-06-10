import { Order, Trade, PaymentMethod } from 'models'
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

    telegramHook.getWebhook.sendMessage(
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
                  confirmation: 'yes',
                  tradeId: trade.id
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
                  confirmation: 'no',
                  tradeId: trade.id
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
  },
  acceptTrade: async function(
    opTUser: TelegramAccount,
    tradeId: number
  ): Promise<Trade | null> {
    const trade = await Trade.acceptTrade(tradeId)
    const openedByUser = await User.findById(trade.openedByUserId, {
      include: [{ model: TelegramAccount }]
    })
    if (trade && openedByUser) {
      const fiatPayAmount = dataFormatter.formatFiatCurrency(
        trade.cryptoAmount * trade.fixedRate,
        trade.order.fiatCurrencyCode
      )
      let paymentDetails = ''
      if (trade.order.paymentMethodId) {
        const pm = await PaymentMethod.getPaymentMethod(
          trade.order.paymentMethodId
        )

        if (pm) {
          pm.fields.forEach((field, index) => {
            paymentDetails =
              paymentDetails +
              `\n${openedByUser.t(
                `payment-methods.fields.${pm.paymentMethod}.field${index + 1}`
              )}: ${field}`
          })
        }
      }
      await telegramHook.getWebhook.sendMessage(
        openedByUser.telegramUser.id,
        openedByUser.t(
          `${Namespace.Exchange}:deals.trade.trade-accepted-notify`,
          {
            tradeId: trade.id,
            fiatPayAmount: fiatPayAmount,
            paymentMethodName: openedByUser.t(
              `payment-methods.names.${trade.order.paymentMethodType}`
            ),
            telegramUsername: '@' + opTUser.username || '-',
            paymentDetails: paymentDetails
          }
        ),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: openedByUser.t(
                    `${Namespace.Exchange}:deals.trade.payment-sent-cbbutton`
                  ),
                  callback_data: stringifyCallbackQuery<
                    DealsStateKey.cb_confirmPaymentSent,
                    DealsState[DealsStateKey.cb_confirmPaymentSent]
                  >(DealsStateKey.cb_confirmPaymentSent, {
                    tradeId: trade.id
                  })
                }
              ]
            ]
          }
        }
      )
    }

    return trade
  },
  rejectTrade: async function(tradeId: number): Promise<Trade | null> {
    const trade = await Trade.rejectTrade(tradeId)
    if (trade) {
      const openedByUser = await User.findById(trade.openedByUserId, {
        include: [{ model: TelegramAccount }]
      })

      if (openedByUser) {
        await telegramHook.getWebhook.sendMessage(
          openedByUser.telegramUser.id,
          openedByUser.t(
            `${Namespace.Exchange}:deals.trade.trade-rejected-notify`,
            {
              tradeId: trade.id
            }
          ),
          {
            parse_mode: 'Markdown',
            reply_markup: keyboardMainMenu(openedByUser)
          }
        )
      }
    }

    return trade
  }
}
