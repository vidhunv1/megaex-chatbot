import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'
import { AccountState, nextAccountState } from './AccountState'

export async function accountParser(
  _msg: TelegramBot.Message,
  telegramId: number,
  _user: User,
  currentState: AccountState
): Promise<AccountState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      return await nextAccountState(currentState, telegramId)
    default:
      return null
  }
}
