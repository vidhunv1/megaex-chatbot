import { BotCommand } from 'chats/types'

export const signupEN = {
  'choose-language': `Hello *{{ name }}*!

You can use this bot to exchange bitcoins locally in your currency.

To get started, choose your *language* from options below.`,

  'terms-and-conditions': `Read our [Terms of Services](https://telegra.ph/Terms-of-Service-06-18), to continue click on ✔️ *I agree* .`,

  'terms-agree-button': '✔️ I agree',

  'select-currency': 'Select your local currency.',

  'account-ready': `✅  *Account created!*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC Address: *{{ bitcoinAddress }}*

🔐 For your security please enable 2-step verification in settings > privacy & security.`,

  'account-ready-generating-address': `✅  *Account created!*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC Address: *{{ bitcoinAddress }}*

🔐 For your security please enable 2-step verification in settings > privacy & security.`,
  'account-ready-continue-button': '🚀 Start trading',
  'home-screen': `🔷  *Megadeals*

Use *exchange* to find trades or *wallet* to withdraw or desposit BTC.`,
  'signup-error':
    'Sorry! An error occurred while registering. Contact us @{{ supportBotUsername }}. 24/7 support.'
}
