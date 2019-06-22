import { BotCommand } from 'chats/types'

export const signupEN = {
  'choose-language': `Hello, *{{ name }}*!

You can buy / sell bitcoins in your local currency here privately and securely.

To get started, choose the language for the app from the options listed below.`,

  'terms-and-conditions': `[Terms of Service](https://telegra.ph/Terms-of-Service-06-18)
  
Click on *Agree* to continue.`,

  'terms-agree-button': '✔️ Agree',

  'select-currency': 'Select your local currency',

  'account-ready': `*Account created!*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}

*Checklist*:
🔐 For your *security* please enable two-step verification on Telegram privacy & security settings.
✔️ Set your username in Telegram so it's easy for users to contact when you are trading.`,
  'account-ready-generating-address': `*Your account on MegaDeals is created!*

  *Account ID*: ${BotCommand.ACCOUNT}{{ accountID }}
  
🔐*Security Tip:*
Enable two-step verification on Telegram: Go to Settings > Privacy & Security > Two-step verification`,
  'account-ready-continue-button': '🚀 Start trading',
  'home-screen': `*Mega Deals*

💵 Exchange: Buy and Sell bitcoins, track your orders.
💼 wallet: Check your account balance and payment methods.`,
  'signup-error':
    'Oops! We are sorry. An error has occurred while registering. Please try again later or contact our support @{{ supportBotUsername }}. We are happy to help 24/7.'
}
