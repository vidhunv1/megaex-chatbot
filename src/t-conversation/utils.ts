export const getCommand = (message: string): BotCommand | null => {
  if (message.startsWith('/')) {
    if (message.startsWith(BotCommand.START)) {
      return BotCommand.START
    } else if (message.startsWith(BotCommand.SETTINGS)) {
      return BotCommand.SETTINGS
    } else if (message.startsWith(BotCommand.HELP)) {
      return BotCommand.HELP
    } else if (message.startsWith(BotCommand.USER)) {
      return BotCommand.USER
    }
  }

  return null
}

export const parseDeepLink = (
  message: string
): { key: DeepLink; value: string } | null => {
  if (getCommand(message) === BotCommand.START) {
    const query = message.replace('/start', '').replace(' ', '')
    const [key, value] = query.split('-')
    return { key: key as DeepLink, value }
  }

  return null
}
