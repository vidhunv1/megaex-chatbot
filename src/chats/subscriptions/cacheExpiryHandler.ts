import logger from 'modules/logger'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import { Transfer, User, TelegramAccount, Trade, TradeStatus } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'

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
    logger.info('Trade Init expired: ' + key)
    const tradeId = parseInt(CacheHelper.getIdFromKey(msg))
    if (tradeId) {
      const trade = await Trade.setExpired(tradeId)
      if (trade && trade.status === TradeStatus.EXPIRED) {
        const openedByUser = await User.findById(trade.openedByUserId, {
          include: [{ model: TelegramAccount }]
        })
        const opUser = await User.findById(trade.order.userId, {
          include: [{ model: TelegramAccount }]
        })

        if (openedByUser) {
          await telegramHook.getWebhook.sendMessage(
            openedByUser.telegramUser.id,
            openedByUser.t(
              `${Namespace.Exchange}:deals.trade.trade-init-no-response`
            ),
            {
              parse_mode: 'Markdown'
            }
          )
        }
        if (opUser) {
          await telegramHook.getWebhook.sendMessage(
            opUser.telegramUser.id,
            opUser.t(`${Namespace.Exchange}:deals.trade.trade-init-expired`, {
              tradeId
            }),
            {
              parse_mode: 'Markdown'
            }
          )
        }

        logger.info('Handled expired trade: ' + tradeId)
      }
    }
  }
}
