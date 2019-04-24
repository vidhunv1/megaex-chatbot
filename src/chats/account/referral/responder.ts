import telegramHook from 'modules/TelegramHook'
import { ReferralStateKey } from './types'
import { Responder } from 'chats/types'
import { AccountState } from '../AccountState'
import * as _ from 'lodash'
import { Namespace } from 'modules/i18n'

export const ReferralResponder: Responder<AccountState> = (
  msg,
  user,
  currentState
) => {
  const resp: Record<ReferralStateKey, () => Promise<boolean>> = {
    [ReferralStateKey.cb_referralLink]: async () => {
      return false
    },

    [ReferralStateKey.referralLink_show]: async () => {
      const data = _.get(
        currentState[ReferralStateKey.cb_referralLink],
        'data',
        null
      )
      if (!data) {
        return false
      }

      const { referralCount, referralLink, referralFeesPercentage } = data
      await telegramHook.getWebhook.sendMessage(
        msg.chat.id,
        user.t(`${Namespace.Account}:referral-info-button`, {
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
      return true
    }
  }

  return resp[currentState.currentStateKey as ReferralStateKey]()
}
