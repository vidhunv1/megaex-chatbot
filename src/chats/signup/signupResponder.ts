import * as TelegramBot from 'node-telegram-bot-api'
import telegramHook from 'modules/TelegramHook'
import { Namespace } from 'modules/I18n'
import { languageKeyboard, currencyKeyboard } from './utils'
import { CryptoCurrency } from 'constants/currencies'
import { defaultKeyboardMenu } from 'chats/common'
import { User, Wallet } from 'models'
import { SignupState } from './SignupState'

export async function signupResponder(
  msg: TelegramBot.Message,
  user: User,
  nextState: SignupState
): Promise<boolean> {
  switch (nextState.currentMessageKey) {
    case 'language':
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
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'termsAndConditions':
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
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'fiatCurrency':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:select-currency`),
        {
          parse_mode: 'Markdown',
          reply_markup: {
            keyboard: currencyKeyboard,
            one_time_keyboard: false,
            resize_keyboard: true
          }
        }
      )
      return true

    case 'accountReady':
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
          one_time_keyboard: false,
          resize_keyboard: true
        }
      })
      return true

    case 'homeScreen':
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Signup}:home-screen`),
        {
          parse_mode: 'Markdown',
          reply_markup: defaultKeyboardMenu(user)
        }
      )
      return true
  }

  return false
}
