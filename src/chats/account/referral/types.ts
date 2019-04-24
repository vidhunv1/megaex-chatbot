import { CallbackDefaults } from 'chats/types'

export enum ReferralStateKey {
  cb_referralLink = 'cb_referralLink',
  referralLink_show = 'referralLink_show'
}

export interface ReferralState {
  [ReferralStateKey.cb_referralLink]?: {
    data: {
      referralLink: string
      referralCount: number
      referralFeesPercentage: number
    } | null
  } & CallbackDefaults
}
