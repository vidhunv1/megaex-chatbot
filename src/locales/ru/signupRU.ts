import { BotCommand } from 'chats/types'

export const signupRU = {
  'choose-language': `Привет!

Вы можете использовать этого бота для локального обмена биткойнов в вашей валюте.

Чтобы начать, выберите ваш *язык* из вариантов ниже.`,

  'terms-and-conditions': `Читайте наш [Terms of Services](https://telegra.ph/Terms-of-Service-06-18), чтобы продолжить нажмите на ✔️ *согласен* .`,

  'terms-agree-button': '✔️ согласен',

  'select-currency': 'Выберите вашу местную валюту.',

  'account-ready': `✅  *Аккаунт создан!*

Идентификатор аккаунта: ${BotCommand.ACCOUNT}{{ accountID }}
BTC Адрес: *{{ bitcoinAddress }}*

🔐 Для вашей безопасности включите двухэтапную проверку в настройках> конфиденциальность и безопасность.`,

  'account-ready-generating-address': `✅  *Аккаунт создан!*

Идентификатор аккаунта: ${BotCommand.ACCOUNT}{{ accountID }}
BTC Адрес: *{{ bitcoinAddress }}*

🔐 Для вашей безопасности включите двухэтапную проверку в настройках> конфиденциальность и безопасность.`,
  'account-ready-continue-button': '🚀 Начать торговать',
  'home-screen': `🔷  *Megadeals*

Используйте *exchange* для поиска сделок или *кошелек* для вывода или депонирования BTC.`,
  'signup-error':
    'Сожалею! Произошла ошибка при регистрации. Свяжитесь с нами @{{ supportBotUsername }}. 24/7 поддержка.'
}
