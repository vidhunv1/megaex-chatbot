enum BotCommand {
  // Global commands
  START = '/start',
  HELP = '/help',
  SETTINGS = '/settings',
  // App commands
  USER = '/u'
}

enum DeepLink {
  REFERRAL = 'ref',
  ACCOUNT = 'acc',
  ORDER = 'order'
}

interface ConversationParams {
  msg: TelegramBot.Message
  user: User
  tUser: TelegramAccount
}

interface ConversationHandler {
  handleCommand: (ConversationParams) => Promise<boolean>
  handleCallback: (ConversationParams) => Promise<boolean>
  handleContext: (ConversationParams) => Promise<boolean>
}
