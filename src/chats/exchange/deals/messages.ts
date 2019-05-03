import telegramHook from 'modules/TelegramHook'
import * as TelegramBot from 'node-telegram-bot-api'
import { User, OrderType } from 'models'
import { Namespace } from 'modules/i18n'
import { PaymentMethods } from 'constants/paymentMethods'
import * as _ from 'lodash'
import { stringifyCallbackQuery } from 'chats/utils'
import { DealsStateKey, DealsState } from './types'
import { dataFormatter } from 'utils/dataFormatter'
import { FiatCurrency, CryptoCurrency } from 'constants/currencies'
import { DealsConfig } from './config'

export const Deals = (msg: TelegramBot.Message, user: User) => ({
  async showDealsMessage(
    cryptoCurrencyCode: CryptoCurrency,
    orderType: OrderType,
    ordersList: {
      orderId: number
      rate: number
      paymentMethod: PaymentMethods
      fiatCurrencyCode: FiatCurrency
      rating: number
    }[],
    totalOrders: number,
    currentCursor: number,
    shouldEdit: boolean
  ) {
    const inline: TelegramBot.InlineKeyboardButton[][] = ordersList.map(
      (order) => {
        const formattedFiatRateRate = dataFormatter.formatFiatCurrency(
          order.rate,
          order.fiatCurrencyCode
        )
        return [
          {
            text: `${formattedFiatRateRate} - ${user.t(
              `payment-methods.short-names.${order.paymentMethod}`
            )} | ${order.rating.toFixed(1)} ⭐️`,
            callback_data: stringifyCallbackQuery<
              DealsStateKey.cb_showDealById,
              DealsState[DealsStateKey.cb_showDealById]
            >(DealsStateKey.cb_showDealById, {
              orderId: order.orderId
            })
          }
        ]
      }
    )

    let nextPageCursor = currentCursor
    let nextPageText = user.t(`${Namespace.Exchange}:deals.next-cbbutton`)
    let prevPageText = user.t(`${Namespace.Exchange}:deals.prev-cbbutton`)
    let prevPageCursor = currentCursor
    if (currentCursor - DealsConfig.LIST_LIMIT >= 0) {
      prevPageCursor = currentCursor - DealsConfig.LIST_LIMIT
      prevPageText = '« ' + prevPageText
    }

    if (currentCursor + DealsConfig.LIST_LIMIT < totalOrders) {
      nextPageCursor = currentCursor + DealsConfig.LIST_LIMIT
      nextPageText = nextPageText + ' »'
    }

    inline.push([
      {
        text: prevPageText,
        callback_data: stringifyCallbackQuery<
          DealsStateKey.cb_prevDeals,
          DealsState[DealsStateKey.cb_prevDeals]
        >(DealsStateKey.cb_prevDeals, {
          cursor: prevPageCursor
        })
      },
      {
        text: nextPageText,
        callback_data: stringifyCallbackQuery<
          DealsStateKey.cb_nextDeals,
          DealsState[DealsStateKey.cb_nextDeals]
        >(DealsStateKey.cb_nextDeals, {
          cursor: nextPageCursor
        })
      }
    ])

    let text
    if (orderType === OrderType.BUY) {
      text = user.t(`${Namespace.Exchange}:deals.show-buy-deals`, {
        cryptoCurrencyCode,
        currentPage: Math.ceil((currentCursor + 1) / DealsConfig.LIST_LIMIT),
        totalPages: Math.ceil(totalOrders / DealsConfig.LIST_LIMIT)
      })
    } else {
      text = user.t(`${Namespace.Exchange}:deals.show-sell-deals`, {
        cryptoCurrencyCode,
        currentPage: Math.ceil((currentCursor + 1) / DealsConfig.LIST_LIMIT),
        totalPages: Math.ceil(totalOrders / DealsConfig.LIST_LIMIT)
      })
    }

    if (shouldEdit) {
      try {
        await telegramHook.getWebhook.editMessageText(text, {
          message_id: msg.message_id,
          chat_id: msg.chat.id,
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: inline
          }
        })
      } catch (e) {
        // todo: to Ignore the editing unchanged message error ///
      }
    } else {
      await telegramHook.getWebhook.sendMessage(msg.chat.id, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: inline
        }
      })
    }
  }
})
