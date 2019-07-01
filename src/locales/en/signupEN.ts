import { BotCommand } from 'chats/types'

export const signupEN = {
  'choose-language': `Hello, *{{ name }}*!

You can buy / sell bitcoins with your local currency from other traders (p2p) with escrow. Every trade is instant, secure, and private.

Choose your *language*.`,

  'terms-and-conditions': `[Terms of Services](https://telegra.ph/Terms-of-Service-06-18)
  
To continue, click on ✔️ *I agree* .`,

  'terms-agree-button': '✔️ I agree',

  'select-currency': 'Select your local currency.',

  'account-ready': `✅  *Account created!*

 Account ID: ${BotCommand.ACCOUNT}{{ accountID }} 
BTC Address: *{{ bitcoinAddress }}*

Note:

🔐 Enable 2-step verification in settings > privacy & security.`,

  'account-ready-generating-address': `✅  *Account created!*

 Account ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC Address: *{{ bitcoinAddress }}*
  
Note:

🔐 Enable 2-step verification in settings > privacy & security.`,
  'account-ready-continue-button': '🚀 Start trading',
  'home-screen': `🔶  *Mega Deals*

Exchange: Buy and sell bitcoins. 
  Wallet: BTC balance and payment methods.`,
  'signup-error':
    'Sorry! An error occurred while registering. Contact us @{{ supportBotUsername }}. 24/7 support.'
}
