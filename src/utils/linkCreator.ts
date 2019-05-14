import { CONFIG } from '../config'
import { DeepLink } from 'chats/types'

const TELEGRAM_BASE_URL = 'https://t.me'

export const linkCreator = {
  getOrderLink(orderId: number): string {
    return `${TELEGRAM_BASE_URL}/${CONFIG.BOT_USERNAME}?start=${
      DeepLink.ORDER
    }-${orderId}`
  },

  getAccountLink(accountId: string): string {
    return `${TELEGRAM_BASE_URL}/${CONFIG.BOT_USERNAME}?start=${
      DeepLink.ACCOUNT
    }-${accountId}`
  }
}
