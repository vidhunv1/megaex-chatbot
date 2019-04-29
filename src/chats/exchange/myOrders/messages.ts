import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType, OrderStatus } from 'models'
import { Namespace } from 'modules/i18n'
import { PaymentMethods } from 'constants/paymentMethods'
import { CryptoCurrency } from 'constants/currencies'
import { dataFormatter } from 'utils/dataFormatter'
import { linkCreator } from 'utils/linkCreator'
import logger from 'modules/Logger'

export const MyOrdersMessage = (msg: TelegramBot.Message, user: User) => ({
  async showMyOrdersMessage() {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Exchange}:my-orders.show-orders`),
      {
        parse_mode: 'Markdown'
      }
    )
  },

  async showOrder(
    orderType: OrderType,
    orderId: number,
    cryptoCurrencyCode: CryptoCurrency,
    rate: number,
    amount: {
      min: number
      max: number
    },
    paymentMethod: PaymentMethods,
    status: OrderStatus,
    terms: string | null
  ) {
    const formattedRate = dataFormatter.formatFiatCurrency(
      rate,
      user.currencyCode
    )

    if (orderType === OrderType.BUY) {
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Exchange}:active-orders.my-buy-order-info`, {
          orderId: orderId,
          cryptoCurrencyCode,
          rate: formattedRate,
          paymentMethod: user.t(`payment-methods.names.${paymentMethod}`),
          minAmount: amount.min,
          maxAmount: amount.max,
          status: user.t(`order.status-name.${status}`),
          orderLink: linkCreator.getOrderLink(orderId),
          terms:
            terms != null && terms != ''
              ? `" ${terms} "`
              : user.t(`${Namespace.Exchange}:active-orders.terms-not-added`)
        }),
        {
          parse_mode: 'Markdown'
        }
      )
    } else {
      logger.error('TODO: not implemented')
    }
  }
})
