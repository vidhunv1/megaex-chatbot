import { telegramHook } from 'modules'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { Namespace } from 'modules/i18n'

export const ReferralMessage = (msg: TelegramBot.Message, user: User) => ({
  async showReferralInfo(
    referralLink: string,
    referralCount: number,
    referralFeesPercentage: number
  ) {
    await telegramHook.getWebhook.sendMessage(
      msg.chat.id,
      user.t(`${Namespace.Account}:referral.show-info`, {
        referralCount,
        referralFeesPercentage
      }),
      {
        parse_mode: 'Markdown'
      }
    )
    await telegramHook.getWebhook.sendMessage(msg.chat.id, referralLink, {
      disable_web_page_preview: true
    })
  }
})
