import * as TelegramBot from 'node-telegram-bot-api'
import { telegramHook } from 'modules'
import { Namespace } from 'modules/i18n'
import { languageKeyboard, currencyKeyboard } from './utils'
import { CryptoCurrency } from 'constants/currencies'
import { keyboardMainMenu } from 'chats/common'
import { User, Wallet } from 'models'
import { SignupState, SignupStateKey } from './SignupState'
import { DeepLink } from 'chats/types'
import * as _ from 'lodash'
import { logger } from 'modules'
import { showUserAccount } from 'chats/account/utils'
import { showOrder } from 'chats/exchange/deals/utils'

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
      // await telegramHook.getWebhook.sendSticker(
      //   msg.chat.id,
      //   'CAADAgAD9gMAAjtKAgABcF8OlmAYAmwC'
      // )
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
            await showUserAccount(msg, user, data.value)
            break
          }

          case DeepLink.ORDER: {
            try {
              await showOrder(msg, user, parseInt(data.value))
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
