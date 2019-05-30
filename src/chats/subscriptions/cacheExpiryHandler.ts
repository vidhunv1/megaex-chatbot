import logger from 'modules/logger'
import { CacheHelper, CacheKey } from 'lib/CacheHelper'
import { Transfer, User, TelegramAccount } from 'models'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { dataFormatter } from 'utils/dataFormatter'

export async function cacheExpiryhandler(msg: string) {
  logger.info('Redis key Expired: ' + msg)

  const key = CacheHelper.getNormalizedKey(msg)
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
  }
}
