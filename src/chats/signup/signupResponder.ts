import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/I18n'
import { languageKeyboard, currencyKeyboard } from './utils'
import { CryptoCurrency } from 'constants/currencies'
import { keyboardMainMenu } from 'chats/common'
import { User, Wallet } from 'models'
import { SignupState, SignupStateKey } from './SignupState'

export async function signupResponder(
  msg: TelegramBot.Message,
  user: User,
  nextState: SignupState
): Promise<boolean> {
  const stateKey = nextState.currentStateKey
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
      return true
  }

  return false
}
