import CacheKeys from '../cache-keys'
import { User, TelegramUser } from '../models'

export default class Account {
  keys: KeysInterface
  constructor(chatId: string | number) {
    this.keys = new CacheKeys(chatId).getKeys()
  }

  getUser() {}
}
