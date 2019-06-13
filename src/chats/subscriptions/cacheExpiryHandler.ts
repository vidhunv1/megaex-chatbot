import logger from 'modules/logger'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import { Transfer, User, TelegramAccount, Trade, TradeStatus } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'
import { sendTradeMessage } from 'chats/exchange/deals/tradeMessage'
import { stringifyCallbackQuery } from 'chats/utils'
import { DealsStateKey, DealsState } from 'chats/exchange/deals'
import { CommonStateKey, CommonState } from 'chats/common/types'

export async function cacheExpiryhandler(msg: string) {
  logger.info('Redis key Expired: ' + msg)

  const key = CacheHelper.getNormalizedKey(msg)

  // Handle payment link expiry
  if (key === CacheKey.PaymentExpiry) {
    const paymentId = parseInt(CacheHelper.getIdFromKey(msg))
    if (paymentId) {
      logger.info('Deleting payment: ' + paymentId)
      const pm = await Transfer.deletePayment(paymentId)

      if (pm) {
        const user = await User.findById(pm.userId, {
          include: [{ model: TelegramAccount }]
        })

        if (user) {
          await telegramHook.getWebhook.sendMessage(
            user.telegramUser.id,
            user.t(`${Namespace.Wallet}:send-coin.payment-link-expired`, {
              cryptoValue: dataFormatter.formatCryptoCurrency(
                pm.amount,
                pm.currencyCode
              )
            }),
            {
              parse_mode: 'Markdown'
            }
          )
        }
      }
    }
  } else if (key === CacheKey.TradeInitExpiry) {
    const tradeId = parseInt(CacheHelper.getIdFromKey(msg))
    if (tradeId) {
      const trade = await Trade.setExpired(tradeId)
      if (trade && trade.status === TradeStatus.EXPIRED) {
        const openedByUser = await User.findById(trade.createdByUserId, {
          include: [{ model: TelegramAccount }]
        })
        const opUser = await User.findById(trade.getOpUserId(), {
          include: [{ model: TelegramAccount }]
        })

        if (openedByUser) {
          await sendTradeMessage[trade.status](
            trade,
            openedByUser,
            openedByUser.telegramUser
          )
        } else {
          logger.error('cacheExpiryHandler, tradeInitExpiry: no openedByUser')
        }
        if (opUser) {
          await sendTradeMessage[trade.status](
            trade,
            opUser,
            opUser.telegramUser
          )
        } else {
          logger.error('cacheExpiryHandler, tradeInitExpiry: no opUser')
        }

        logger.info('Handled expired trade: ' + tradeId)
      }
    }
  } else if (key === CacheKey.TradeEscrowWarnExpiry) {
    const tradeId = parseInt(CacheHelper.getIdFromKey(msg))
    if (tradeId) {
      const trade = await Trade.findById(tradeId)
      if (trade) {
        if (trade.status !== TradeStatus.ACCEPTED) {
          return
        }
        const buyerUser = await User.findById(trade.buyerUserId, {
          include: [{ model: TelegramAccount }]
        })
        const sellerUser = await User.findById(trade.sellerUserId, {
          include: [{ model: TelegramAccount }]
        })

        const paymentSendTimeoutS = trade.getEscrowReleaseSecondsLeft()
        if (buyerUser) {
          await telegramHook.getWebhook.sendMessage(
            buyerUser.telegramUser.id,
            buyerUser.t(`${Namespace.Exchange}:deals.trade.escrow-warn-buyer`, {
              tradeId: trade.id,
              paymentSendTimeout: paymentSendTimeoutS
                ? (paymentSendTimeoutS / 60).toFixed(0)
                : '-'
            }),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: buyerUser.t(
                        `${
                          Namespace.Exchange
                        }:deals.trade.payment-sent-cbbutton`
                      ),
                      callback_data: stringifyCallbackQuery<
                        DealsStateKey.cb_paymentSent,
                        DealsState[DealsStateKey.cb_paymentSent]
                      >(DealsStateKey.cb_paymentSent, {
                        tradeId: trade.id
                      })
                    },
                    {
                      text: buyerUser.t(
                        `${Namespace.Exchange}:deals.cancel-trade-cbbutton`
                      ),
                      callback_data: stringifyCallbackQuery<
                        DealsStateKey.cb_cancelTrade,
                        DealsState[DealsStateKey.cb_cancelTrade]
                      >(DealsStateKey.cb_cancelTrade, {
                        tradeId: trade.id
                      })
                    }
                  ]
                ]
              }
            }
          )
        }
        if (sellerUser) {
          await telegramHook.getWebhook.sendMessage(
            sellerUser.telegramUser.id,
            sellerUser.t(
              `${Namespace.Exchange}:deals.trade.escrow-warn-seller`,
              {
                tradeId: trade.id,
                paymentSendTimeout: paymentSendTimeoutS
                  ? (paymentSendTimeoutS / 60).toFixed(0)
                  : '-'
              }
            ),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: sellerUser.t('contact-legal-cbbutton'),
                      callback_data: stringifyCallbackQuery<
                        CommonStateKey.cb_contactLegal,
                        CommonState[CommonStateKey.cb_contactLegal]
                      >(CommonStateKey.cb_contactLegal, {
                        tradeId: trade.id,
                        userId: sellerUser.id
                      })
                    }
                  ]
                ]
              }
            }
          )
        }
      }
    }
  } else if (key === CacheKey.TradeEscrowClosedExpiry) {
    const tradeId = parseInt(CacheHelper.getIdFromKey(msg))
    if (tradeId) {
      const trade = await Trade.closeEscrow(tradeId)
      if (trade) {
        const sellerUser = await User.findById(trade.sellerUserId, {
          include: [{ model: TelegramAccount }]
        })
        const buyerUser = await User.findById(trade.buyerUserId, {
          include: [{ model: TelegramAccount }]
        })
        if (sellerUser) {
          sendTradeMessage[trade.status](
            trade,
            sellerUser,
            sellerUser.telegramUser
          )
        }
        if (buyerUser) {
          sendTradeMessage[trade.status](
            trade,
            buyerUser,
            buyerUser.telegramUser
          )
        }
      } else {
        logger.error(
          'ALERT: TradeEscrowClosedExpiry could not close escrow for ' + tradeId
        )
      }
    }
  }
}
