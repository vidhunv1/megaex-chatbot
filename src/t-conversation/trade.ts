import * as TelegramBot from 'node-telegram-bot-api'
import {
  TelegramAccount,
  User,
  PaymentMethod,
  PaymentDetail,
  Market,
  Wallet,
  Order
} from '../models'
import logger from '../modules/logger'
import cacheConnection from '../modules/cache'
import telegramHook from '../modules/telegram-hook'
import {
  stringifyCallbackQuery,
  ICallbackFunction,
  ICallbackQuery,
  keyboardMenu,
  parseRange
} from './defaults'
import { CacheKeys } from '../cache-keys'
import { CONFIG } from '../config'

const tBot = telegramHook.getBot()

const CONTEXT_TRADE_BUY = 'TRADE_BUY'
const CONTEXT_TRADE_SELL = 'TRADE_SELL'
const CONTEXT_TRADE_EDIT_AMOUNT = 'TRADE_EDIT_AMOUNT'
const CONTEXT_TRADE_EDIT_RATE = 'TRADE_EDIT_RATE'
const CONTEXT_TRADE_EDIT_TERMS = 'TRADE_EDIT_TERMS'

const tradeConversation = async function(
  msg: TelegramBot.Message | null,
  user: User,
  tUser: TelegramAccount
): Promise<boolean> {
  const cacheKeys = new CacheKeys(tUser.id).getKeys()
  const cacheClient = await cacheConnection.getCacheClient()
  if (msg && msg.text === user.__('menu_buy_sell')) {
    const rate = await Market.getValue('btc', user.currencyCode)
    let localizedRate = 'N/A'
    const hasOpenOrders = true

    if (rate)
      localizedRate = rate.toLocaleString(tUser.languageCode, {
        style: 'currency',
        currency: user.currencyCode
      })
    const replyMarkup: TelegramBot.InlineKeyboardButton[][] = []
    if (hasOpenOrders)
      replyMarkup.push([
        {
          text: user.__('open_orders %d', 0),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.MyOrders,
            null,
            null
          )
        },
        {
          text: user.__('create_order'),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.CreateOrder,
            null,
            null
          )
        }
      ])
    else
      replyMarkup.push([
        {
          text: user.__('create_order'),
          callback_data: stringifyCallbackQuery(
            ICallbackFunction.CreateOrder,
            null,
            null
          )
        }
      ])

    replyMarkup.push([
      {
        text: user.__('buy_button'),
        callback_data: stringifyCallbackQuery(ICallbackFunction.Buy, null, null)
      }
    ])
    replyMarkup.push([
      {
        text: user.__('sell_button'),
        callback_data: stringifyCallbackQuery(
          ICallbackFunction.Sell,
          null,
          null
        )
      }
    ])

    tBot.sendMessage(
      msg.chat.id,
      user.__(
        'buy_sell_message %s %s %s',
        CONFIG.SUPPORT_USERNAME,
        user.currencyCode.toUpperCase(),
        localizedRate
      ),
      {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: replyMarkup
        }
      }
    )

    return true
  } else if (msg && msg.text === user.__('sell_btc_order_create')) {
    await cacheClient.delAsync(cacheKeys.tContext.key)
    await cacheClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_TRADE_SELL
    )
    const pm = await PaymentMethod.findOne({ where: { userId: user.id } })
    if (pm) {
      const wallet: Wallet | null = await Wallet.find({
        where: { userId: user.id, currencyCode: 'btc' }
      })

      if (wallet) {
        await tBot.sendMessage(
          tUser.id,
          user.__(
            'sell_btc_enter_amount %s %f',
            user.currencyCode.toUpperCase(),
            wallet.availableBalance.toFixed(6).replace(/\.?0*$/, '')
          ),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: keyboardMenu(user),
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }
        )
        cacheClient.expireAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.expiry
        )
      }
    } else {
      await tBot.sendMessage(tUser.id, user.__('no_payment_methods'), {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: user.__('add_payment_method'),
                callback_data: stringifyCallbackQuery(
                  ICallbackFunction.AddPayment,
                  null,
                  null
                )
              }
            ]
          ]
        }
      })
    }

    return true
  } else if (msg && msg.text === user.__('buy_btc_order_create')) {
    await cacheClient.delAsync(cacheKeys.tContext.key)
    await cacheClient.hmsetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext.currentContext,
      CONTEXT_TRADE_BUY,
      cacheKeys.tContext['Trade.isParsePaymethod'],
      1
    )
    cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)

    // Choose required payment method:
    const payNames: string[] = await PaymentDetail.getPaymethodNames(user)
    const keyboard: TelegramBot.KeyboardButton[][] = []
    for (let i = 0; i < payNames.length; i++) {
      keyboard.push([{ text: payNames[i] }])
    }
    await tBot.sendMessage(msg.chat.id, user.__('buy_btc_select_paymethod'), {
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: keyboard,
        one_time_keyboard: false,
        resize_keyboard: true
      }
    })

    return true
  } else if (msg && msg.text && msg.text.startsWith('/o')) {
    await tBot.sendMessage(msg.chat.id, 'TODO: Handlde show order')

    return true
  }

  return false
}

const tradeCallback = async function(
  _msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  query: ICallbackQuery
): Promise<boolean> {
  const cacheClient = await cacheConnection.getCacheClient()
  const cacheKeys = new CacheKeys(tUser.id).getKeys()
  switch (query.callbackFunction) {
    case ICallbackFunction.Buy:
      tBot.sendMessage(tUser.id, `[TODO] Show buy orders list`)
      return true

    case ICallbackFunction.Sell:
      tBot.sendMessage(tUser.id, `[TODO] Show sell orders list`)
      return true

    case ICallbackFunction.CreateOrder:
      await cacheClient.delAsync(cacheKeys.tContext.key)
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      await tBot.sendMessage(tUser.id, user.__('create_order_message'), {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [{ text: user.__('buy_btc_order_create') }],
            [{ text: user.__('sell_btc_order_create') }],
            [{ text: user.__('cancel_text') }]
          ],
          one_time_keyboard: true,
          resize_keyboard: true
        }
      })
      return true

    case ICallbackFunction.MyOrders:
      tBot.sendMessage(tUser.id, `[TODO] Show my orders list`)
      return true

    case ICallbackFunction.UseMarketRate:
      if (query.useMarketRate) {
        const price = await Market.getValue('btc', user.currencyCode)
        if (query.useMarketRate.type === 'buy' && price) {
          handleOrderCreateInputPrice(price, 'market', 'buy', user, tUser)
        } else if (query.useMarketRate.type === 'sell' && price) {
          handleOrderCreateInputPrice(price, 'market', 'buy', user, tUser)
        }
      }
      return true

    case ICallbackFunction.OrderEditAmount:
      if (query.orderEditAmount && query.orderEditAmount.orderId)
        await cacheClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_AMOUNT,
          cacheKeys.tContext['Trade.editOrderId'],
          query.orderEditAmount.orderId
        )
      await tBot.sendMessage(tUser.id, user.__('btc_edit_amount'), {
        parse_mode: 'Markdown'
      })
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      return true

    case ICallbackFunction.OrderEditRate:
      if (query.orderEditRate && query.orderEditRate.orderId)
        await cacheClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_RATE,
          cacheKeys.tContext['Trade.editOrderId'],
          query.orderEditRate.orderId
        )
      await tBot.sendMessage(
        tUser.id,
        user.__(
          'btc_edit_rate %s %s %s',
          await Market.getValue('btc', user.currencyCode),
          user.currencyCode.toUpperCase(),
          '2%'
        ),
        {
          parse_mode: 'Markdown'
        }
      )
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      return true

    case ICallbackFunction.OrderEditTerms:
      if (query.orderEditTerms && query.orderEditTerms.orderId)
        await cacheClient.hmsetAsync(
          cacheKeys.tContext.key,
          cacheKeys.tContext.currentContext,
          CONTEXT_TRADE_EDIT_TERMS,
          cacheKeys.tContext['Trade.editOrderId'],
          query.orderEditTerms.orderId
        )
      await tBot.sendMessage(tUser.id, user.__('btc_edit_terms'), {
        parse_mode: 'Markdown'
      })
      cacheClient.expireAsync(cacheKeys.tContext.key, cacheKeys.tContext.expiry)
      return true

    case ICallbackFunction.OrderSetActive:
      await tBot.sendMessage(tUser.id, '[TODO] HANDLE SET ACTIVE')
      return true
  }
  return false
}

const tradeContext = async function(
  msg: TelegramBot.Message,
  user: User,
  tUser: TelegramAccount,
  context: string
): Promise<boolean> {
  const cacheClient = await cacheConnection.getCacheClient()
  const cacheKeys = new CacheKeys(tUser.id).getKeys()
  const [isInputPrice] = await cacheClient.hmgetAsync(
    cacheKeys.tContext.key,
    cacheKeys.tContext['Trade.isInputPrice']
  )

  if (context === CONTEXT_TRADE_BUY && msg.text) {
    const [isParsePaymethod] = await cacheClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext['Trade.isParsePaymethod']
    )
    if (isInputPrice) {
      handleOrderCreateInputPrice(
        parseInt(msg.text),
        'fixed',
        'buy',
        user,
        tUser
      )
    } else if (isParsePaymethod) {
      await cacheClient.hdelAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext['Trade.isParsePaymethod']
      )
      const paymethodId = await PaymentDetail.getPaymethodID(user, msg.text)
      if (msg.text && paymethodId >= 0) {
        await tBot.sendMessage(
          msg.chat.id,
          user.__('buy_btc_enter_amount %s', user.currencyCode.toUpperCase()),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: [[{ text: user.__('cancel_text') }]],
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }
        )
      } else {
        await cacheClient.delAsync(cacheKeys.tContext.key)
        await tBot.sendMessage(
          msg.chat.id,
          user.__('invalid_input', user.currencyCode),
          {
            parse_mode: 'Markdown',
            reply_markup: {
              keyboard: keyboardMenu(user),
              one_time_keyboard: false,
              resize_keyboard: true
            }
          }
        )
      }
    } else {
      handleOrderCreate(msg.text, user, tUser, 'buy')
    }
    return true
  } else if (context === CONTEXT_TRADE_SELL && msg.text) {
    if (isInputPrice) {
      handleOrderCreateInputPrice(
        parseInt(msg.text),
        'fixed',
        'buy',
        user,
        tUser
      )
    } else {
      handleOrderCreate(msg.text, user, tUser, 'sell')
    }
    return true
  } else if (context === CONTEXT_TRADE_EDIT_AMOUNT && msg.text) {
    const [minAmount, maxAmount] = await parseRange(msg.text)
    if (!maxAmount) {
      tBot.sendMessage(
        tUser.id,
        user.__('buy_invalid_amount %s', user.currencyCode.toUpperCase()),
        { parse_mode: 'markdown' }
      )
    } else {
      const [orderId] = await cacheClient.hmgetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext['Trade.editOrderId']
      )
      cacheClient.delAsync(cacheKeys.tContext.key)
      const [updatedRows] = await Order.update(
        { maxAmount, minAmount },
        { where: { id: orderId } }
      )
      if (updatedRows === 1) {
        const order = await Order.findOne({ where: { id: orderId } })
        await tBot.sendMessage(tUser.id, user.__('order_updated'), {
          parse_mode: 'markdown'
        })
        if (order) {
          showOrder(user, tUser, order, msg.message_id + 1, false)
        } else {
          logger.error('Error Trade: 247')
        }
      }
    }

    return true
  } else if (context === CONTEXT_TRADE_EDIT_RATE && msg.text) {
    const [orderId] = await cacheClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext['Trade.editOrderId']
    )
    let updatedRows = -1
    if (msg.text.indexOf('%') > -1) {
      const margin = parseFloat(msg.text)
      if (margin >= 0) {
        ;[updatedRows] = await Order.update(
          { marginPercentage: margin, price: null },
          { where: { id: orderId } }
        )
        cacheClient.delAsync(cacheKeys.tContext.key)
      } else {
        await tBot.sendMessage(tUser.id, user.__('invalid_input'), {
          parse_mode: 'markdown'
        })
      }
    } else {
      const rate = parseInt(msg.text)
      if (rate >= 0) {
        ;[updatedRows] = await Order.update(
          { price: rate },
          { where: { id: orderId } }
        )
        cacheClient.delAsync(cacheKeys.tContext.key)
      } else {
        await tBot.sendMessage(tUser.id, user.__('invalid_input'), {
          parse_mode: 'markdown'
        })
      }
      cacheClient.delAsync(cacheKeys.tContext.key)
    }
    if (updatedRows === 1) {
      const order = await Order.findOne({ where: { id: orderId } })
      await tBot.sendMessage(tUser.id, user.__('order_updated'), {
        parse_mode: 'markdown'
      })
      if (order) {
        showOrder(user, tUser, order, msg.message_id + 1, false)
      } else {
        logger.error('Error Trade: 247')
      }
    }
    return true
  } else if (context === CONTEXT_TRADE_EDIT_TERMS && msg.text) {
  }
  return false
}

async function handleOrderCreate(
  msg: string,
  user: User,
  tUser: TelegramAccount,
  type: 'buy' | 'sell'
) {
  const cacheClient = await cacheConnection.getCacheClient()
  if (!msg) return
  const cacheKeys = new CacheKeys(tUser.id).getKeys()

  if (type === 'buy') {
    const [minAmount, maxAmount] = await parseRange(msg)

    if (!maxAmount) {
      // invalid amount entered
      tBot.sendMessage(
        tUser.id,
        user.__('buy_invalid_amount %s', user.currencyCode.toUpperCase()),
        { parse_mode: 'markdown' }
      )
    } else {
      await cacheClient.hmsetAsync(
        cacheKeys.tContext.key,
        cacheKeys.tContext['Trade.maxAmount'],
        maxAmount,
        cacheKeys.tContext['Trade.minAmount'],
        minAmount,
        cacheKeys.tContext['Trade.isInputPrice'],
        1
      )

      tBot.sendMessage(
        tUser.id,
        user.__('buy_btc_enter_price %s', user.currencyCode.toUpperCase(), {
          parse_mode: 'markdown'
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: user.__(
                    'use_market_rate %d %s',
                    await Market.getValue('btc', user.currencyCode),
                    user.currencyCode.toUpperCase()
                  ),
                  callback_data: stringifyCallbackQuery(
                    ICallbackFunction.UseMarketRate,
                    null,
                    { type: 'buy' }
                  )
                }
              ]
            ]
          }
        }
      )
    }
  } else if (type === 'sell') {
    const [minAmount, maxAmount] = await parseRange(msg)
    if (!maxAmount) {
      // invalid amount entered
      tBot.sendMessage(
        tUser.id,
        user.__('sell_invalid_amount %s', user.currencyCode.toUpperCase()),
        {
          parse_mode: 'Markdown'
        }
      )
    } else {
      const wallet: Wallet | null = await Wallet.find({
        where: { userId: user.id, currencyCode: 'btc' }
      })
      if (wallet) {
        if (maxAmount > wallet.availableBalance) {
          // insufficient funds for sell order
          cacheClient.delAsync(cacheKeys.tContext.key)

          tBot.sendMessage(
            tUser.id,
            user.__(
              'sell_isufficient_balance %f %s',
              wallet.availableBalance,
              wallet.address
            ),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                keyboard: keyboardMenu(user)
              }
            }
          )
        } else {
          await cacheClient.hmsetAsync(
            cacheKeys.tContext.key,
            cacheKeys.tContext['Trade.minAmount'],
            minAmount,
            cacheKeys.tContext['Trade.maxAmount'],
            maxAmount,
            cacheKeys.tContext['Trade.isInputPrice'],
            1
          )
          tBot.sendMessage(
            tUser.id,
            user.__('sell_btc_enter_price %s', user.currencyCode.toUpperCase()),
            {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    {
                      text: user.__(
                        'use_market_rate %d %s',
                        await Market.getValue('btc', user.currencyCode),
                        user.currencyCode.toUpperCase()
                      ),
                      callback_data: stringifyCallbackQuery(
                        ICallbackFunction.UseMarketRate,
                        null,
                        { type: 'sell' }
                      )
                    }
                  ]
                ]
              }
            }
          )
        }
      }
    }
  }
}

async function handleOrderCreateInputPrice(
  fiatPrice: number,
  priceType: 'market' | 'fixed',
  orderType: 'buy' | 'sell',
  user: User,
  tUser: TelegramAccount
) {
  const cacheKeys = new CacheKeys(tUser.id).getKeys()
  const cacheClient = await cacheConnection.getCacheClient()
  if (fiatPrice && fiatPrice !== NaN && fiatPrice > 0) {
    const [maxAmount, minAmount] = await cacheClient.hmgetAsync(
      cacheKeys.tContext.key,
      cacheKeys.tContext['Trade.maxAmount'],
      cacheKeys.tContext['Trade.minAmount']
    )
    cacheClient.delAsync(cacheKeys.tContext.key)
    if (orderType === 'buy') {
      let order = new Order()
      const price = priceType === 'market' ? null : fiatPrice
      try {
        order = await order.createBuyOrder(
          user.id,
          minAmount,
          maxAmount,
          price,
          'btc'
        )
        if (order) {
          const m1 = await tBot.sendMessage(
            tUser.id,
            `[TODO PLACE buy ORDER]: amount ${minAmount} - ${maxAmount}, price: ${fiatPrice} priceType: ${priceType}`
          )
          if (m1 instanceof Error) {
            tBot.sendMessage(tUser.id, user.__('error_unknown'))
          } else {
            await showOrder(user, tUser, order, m1.message_id + 1, false)
          }
        }
      } catch (e) {
        logger.error(JSON.stringify(e))
        tBot.sendMessage(tUser.id, user.__('error_unknown'))
      }
    } else if (orderType === 'sell') {
      tBot.sendMessage(
        tUser.id,
        `[TODO PLACE sell ORDER]: amount ${minAmount} - ${maxAmount}, price: ${fiatPrice} priceType: ${priceType}`
      )
    }
  } else {
    // invalid price entered
    if (orderType === 'buy')
      tBot.sendMessage(
        tUser.id,
        user.__('buy_invalid_price %s', user.currencyCode.toUpperCase()),
        { parse_mode: 'Markdown' }
      )
    else
      tBot.sendMessage(
        tUser.id,
        user.__('sell_invalid_price %s', user.currencyCode.toUpperCase()),
        { parse_mode: 'Markdown' }
      )
  }
}

async function showOrder(
  user: User,
  tUser: TelegramAccount,
  order: Order,
  thisMessageId: number,
  shouldEdit: boolean = false
) {
  let inlineKeyboard: TelegramBot.InlineKeyboardMarkup = {
    inline_keyboard: []
  }
  let message = ''

  if (order.type === 'buy') {
    const amountText: string = order.minAmount
      ? order.minAmount + ' - ' + order.maxAmount
      : order.maxAmount + ' BTC'
    const marketPrice: number | null = await Market.getValue(
      'btc',
      user.currencyCode
    )
    let marginPrice: number | null = marketPrice
    if (marketPrice) {
      marginPrice = marketPrice + (marketPrice * order.marginPercentage) / 100
    }
    const priceText: string = order.price
      ? order.price + ' ' + user.currencyCode.toUpperCase()
      : marginPrice + ' ' + user.currencyCode.toUpperCase()
    inlineKeyboard = {
      inline_keyboard: [
        [
          {
            text: user.__('order_inline_amount'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditAmount,
              null,
              { orderId: order.id }
            )
          },
          {
            text: user.__('order_inline_rate'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditRate,
              null,
              { orderId: order.id }
            )
          },
          {
            text: user.__('order_inline_terms'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderEditTerms,
              null,
              { orderId: order.id }
            )
          }
        ],
        [
          {
            text: user.__('inline_back'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.GoBack,
              thisMessageId,
              null
            )
          },
          {
            text:
              order.status === 'stopped'
                ? user.__('order_inline_turnon')
                : user.__('order_inline_turnoff'),
            callback_data: stringifyCallbackQuery(
              ICallbackFunction.OrderSetActive,
              null,
              { active: order.status === 'stopped', orderId: order.id }
            )
          }
        ]
      ]
    }
    if (order.price) {
      message = user.__(
        'show_buy_order_fixed %s %s %s %s %s %s',
        '/o' + order.id,
        amountText,
        priceText,
        order.paymentMethodFilters,
        user.__('order_status_' + order.status),
        'https://t.me/' + CONFIG.BOT_USERNAME + '/start=order-' + order.id
      )
    } else {
      message = user.__(
        'show_buy_order_margin %s %s %s %s %s %f %s %s %s %s',
        '/o' + order.id,
        amountText,
        priceText,
        marketPrice,
        order.marginPercentage >= 0 ? '+' : '-',
        order.marginPercentage,
        order.paymentMethodFilters,
        user.__('order_status_' + order.status),
        'https://t.me/' + CONFIG.BOT_USERNAME + '/start=order-' + order.id,
        '%'
      )
    }
  } else if (order.type === 'sell') {
  }

  if (shouldEdit) {
    await tBot.editMessageText(message, {
      parse_mode: 'Markdown',
      chat_id: tUser.id,
      message_id: thisMessageId,
      reply_markup: inlineKeyboard,
      disable_web_page_preview: true
    })
  } else {
    await tBot.sendMessage(tUser.id, message, {
      parse_mode: 'Markdown',
      reply_markup: inlineKeyboard
    })
  }
}

export { tradeConversation, tradeCallback, tradeContext }
