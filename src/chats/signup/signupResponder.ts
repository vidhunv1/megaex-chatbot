import * as TelegramBot from 'node-telegram-bot-api'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { languageKeyboard, currencyKeyboard } from './utils'
import { CryptoCurrency } from 'constants/currencies'
import { keyboardMainMenu } from 'chats/common'
import { User, Wallet, Order, Transaction } from 'models'
import { SignupState, SignupStateKey } from './SignupState'
import { DeepLink } from 'chats/types'
import * as _ from 'lodash'
import { logger } from 'modules'
import { DealsMessage } from 'chats/exchange/deals'
import { AccountHomeMessage } from 'chats/account/home'

export async function signupResponder(
  msg: TelegramBot.Message,
  user: User,
  state: SignupState
): Promise<boolean> {
  const stateKey = state.currentStateKey
  switch (stateKey) {
    case SignupStateKey.signupError:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:signup-error`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: [[]],
            resize_keyboard: true
          }
        }
      )
      return true
    case SignupStateKey.language:
      await telegramHook.getWebhook.sendSticker(
        msg.chat.id,
        'CAADAgADKgMAAs-71A4f8rUYf2WfMAI'
      )
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:choose-language`, {
          name: msg.from && msg.from.first_name
        }),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: languageKeyboard,
            resize_keyboard: true
          }
        }
      )
      return true

    case SignupStateKey.termsAndConditions:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:terms-and-conditions`),
        {
          parse_mode: 'Markdown',
          disable_web_page_preview: true,
          reply_markup: {
            keyboard: [
              [{ text: user.t(`${Namespace.Signup}:terms-agree-button`) }]
            ],
            resize_keyboard: true
          }
        }
      )
      return true

    case SignupStateKey.fiatCurrency:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:select-currency`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: currencyKeyboard,
            resize_keyboard: true
          }
        }
      )
      return true

    case SignupStateKey.accountReady:
      const wallet = await Wallet.findOne({
        where: {
          userId: user.id,
          currencyCode: CryptoCurrency.BTC
        }
      })

      let message
      if (wallet) {
        message = user.t(`${Namespace.Signup}:account-ready`, {
          accountID: user.accountId,
          bitcoinAddress: wallet.address
        })
      } else {
        message = user.t(
          `${Namespace.Signup}:account-ready-generating-address`,
          { accountID: user.accountId }
        )
      }

      await telegramHook.getWebhook.sendMessage(msg.chat.id, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          keyboard: [
            [
              {
                text: user.t(
                  `${Namespace.Signup}:account-ready-continue-button`
                )
              }
            ]
          ],
          resize_keyboard: true
        }
      })
      return true

    case SignupStateKey.homeScreen:
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:home-screen`),
        {
          parse_mode: 'Markdown',
          reply_markup: keyboardMainMenu(user)
        }
      )

      const data = _.get(state[SignupStateKey.start], 'data', null)
      if (data != null && data.deeplink != null && data.value != null) {
        switch (data.deeplink) {
          case DeepLink.ACCOUNT: {
            const accountInfo = await getAccount(data.value)
            if (accountInfo != null) {
              await AccountHomeMessage(msg, user).showDealerAccount(
                accountInfo.accountId,
                accountInfo.telegramUsername,
                accountInfo.dealCount,
                accountInfo.tradeVolume,
                accountInfo.cryptoCurrencyCode,
                accountInfo.tradeSpeed,
                accountInfo.rating,
                accountInfo.reviewCount
                // accountInfo.isUserBlocked
              )
            }
            break
          }

          case DeepLink.ORDER: {
            try {
              const { order, dealer } = await getOrder(parseInt(data.value))
              if (order && dealer) {
                const availableBalance = await getAvailableBalance(
                  order.userId,
                  order.cryptoCurrencyCode
                )
                const availableBalanceInFiat =
                  (await Order.convertToFixedRate(
                    order.rate,
                    order.rateType,
                    order.cryptoCurrencyCode,
                    order.fiatCurrencyCode,
                    user.exchangeRateSource
                  )) * availableBalance

                await DealsMessage(msg, user).showDeal(
                  order.orderType,
                  order.id,
                  order.cryptoCurrencyCode,
                  dealer.telegramUser.firstName,
                  dealer.accountId,
                  dealer.lastSeen,
                  dealer.rating,
                  dealer.tradeCount,
                  order.terms,
                  order.paymentMethodType,
                  await Order.convertToFixedRate(
                    order.rate,
                    order.rateType,
                    order.cryptoCurrencyCode,
                    order.fiatCurrencyCode,
                    dealer.exchangeRateSource
                  ),
                  {
                    min: order.minFiatAmount,
                    max: order.maxFiatAmount
                  },
                  availableBalanceInFiat,
                  order.fiatCurrencyCode,
                  dealer.reviewCount
                )
              }
            } catch (e) {
              logger.warn('Invalid order id in start ' + data.value)
            }
            break
          }
        }
      }

      return true
  }

  return false
}

async function getOrder(orderId: number) {
  logger.error('TODO: signupresponder Implement getOrder with user details')

  const order = await Order.getOrder(orderId)
  if (!order) {
    return {
      order: null,
      dealer: null
    }
  }

  const dealer = await User.getUser(order.userId)
  if (!dealer) {
    return {
      order: null,
      dealer: null
    }
  }

  return {
    order: order,
    dealer: {
      ...dealer,
      rating: 4.7,
      lastSeen: new Date(),
      tradeCount: 5,
      reviewCount: 30
    }
  }
}

async function getAvailableBalance(
  userId: number,
  currencyCode: CryptoCurrency
) {
  return await Transaction.getAvailableBalance(userId, currencyCode)
}

// TODO: -----------

async function getAccount(
  accountId: string
): Promise<{
  accountId: string
  telegramUsername: string
  dealCount: number
  tradeVolume: number
  cryptoCurrencyCode: CryptoCurrency
  tradeSpeed: number
  reviewCount: number
  // isUserBlocked: boolean,
  rating: number
} | null> {
  logger.error('TODO: singupresponder implement getAccount')
  return {
    accountId,
    telegramUsername: 'satoshi',
    dealCount: 4,
    tradeVolume: 100,
    cryptoCurrencyCode: CryptoCurrency.BTC,
    tradeSpeed: 100,
    reviewCount: 30,
    // isUserBlocked: false,
    rating: 4.5
  }
}
