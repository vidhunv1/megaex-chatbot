import { ExchangeState, nextExchangeState } from './ExchangeState'
import * as TelegramBot from 'node-telegram-bot-api'
import { User } from 'models'

export async function exchangeParser(
  _msg: TelegramBot.Message,
  telegramId: number,
  _user: User,
  currentState: ExchangeState
): Promise<ExchangeState | null> {
  switch (currentState.currentMessageKey) {
    case 'start':
      return await nextExchangeState(currentState, telegramId)
    default:
      return null
  }
}
