import { BotCommand } from 'chats/types'

export const signupEN = {
  'choose-language': `Hello, *{{ name }}*!

 Mega Deals is a telegram bot that allows you to buy and sell bitcoins with your local currency privately and securely. 
 
 To get started, choose the language for the app from the options listed below:`,

  'terms-and-conditions': `Great! By clicking on *✅ I Agree*; you agree to our [Terms of Service](https://google.com) and [Privacy Policy](https://google.com).`,

  'terms-agree-button': '✅ I Agree',

  'select-currency': 'Select your local currency',

  'account-ready': `*Your account on MegaDeals is created!*

*Account ID*: ${BotCommand.ACCOUNT}{{ accountID }}
Your BTC address is {{ bitcoinAddress }}

🔐 For your *security* please enable two-step verification on Telegram: Go to Settings > Privacy & Security > Two-step verification`,

  'account-ready-generating-address': `*Your account on MegaDeals is created!*

  *Account ID*: ${BotCommand.ACCOUNT}{{ accountID }}
  
🔐*Security Tip:*
Enable two-step verification on Telegram: Go to Settings > Privacy & Security > Two-step verification`,
  'account-ready-continue-button': '🚀 Start trading',
  'home-screen': `*Mega Deals*

1. 💵Exchange: Buy and Sell bitcoins. Track your orders.
2. 💼wallet: Check your account balance and payment methods. `,
  'signup-error':
    'Oops! We are sorry. An error has occurred while registering. Please try again later or contact our support @{{ supportBotUsername }}. We are happy to help 24/7.'
}
