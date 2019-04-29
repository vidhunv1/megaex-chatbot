import { CONFIG } from '../config'

const TELEGRAM_BASE_URL = 'https://t.me'

export const linkCreator = {
  getOrderLink(orderId: number): string {
    return `${TELEGRAM_BASE_URL}/${CONFIG.BOT_USERNAME}?start=o-${orderId}`
  },

  getAccountLink(accountId: string): string {
    return `${TELEGRAM_BASE_URL}/${CONFIG.BOT_USERNAME}?start=a-${accountId}`
  }
}
