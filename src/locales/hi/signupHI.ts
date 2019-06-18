import { BotCommand } from 'chats/types'

export const signupHI = {
  'choose-language': `Hello, *{{ name }}*!

 Mega Deals is a telegram bot that allows you to buy and sell bitcoins with your local currency privately and securely. 
 
 To get started, choose the language for the app from the options listed below:`,

  'terms-and-conditions': `Aapne language 'Hindi' select kiya hai. Ab *✅ I Accept* pe click kare. *✅ I Accept* pe click karne se aap humare [Terms of Service](https://google.com) and [Privacy Policy](https://google.com) ko accept kar rahe hai.`,

  'terms-agree-button': '✅ I Agree',

  'select-currency': 'Aapka local currency kya hai?',

  'account-ready': `*Aapka MegaDeals account ready hai!*

*Account ID*: ${BotCommand.ACCOUNT}{{ accountID }}
Your BTC address is {{ bitcoinAddress }}

🔐*Apna account secure rakhein:*
Telegram pe 2-step verification use karein: Settings > Privacy & Security > Two-step verification`,

  'account-ready-generating-address': `**Aapka MegaDeals account ready hai!*

  *Account ID*: ${BotCommand.ACCOUNT}{{ accountID }}
  
🔐*Apna account secure rakhein:*
Telegram pe 2-step verification use karein: Settings > Privacy & Security > Two-step verification`,
  'account-ready-continue-button': '🚀 Start trading',
  'home-screen': `*Mega Deals*

💵 Exchange BTC-INR: Bitcoins kharide aur bechiye. Apne orders ko track karein.
💼 My Wallet: Apna account balance check karein aur payment add karein.`,
  'signup-error':
    'Sorry! Kisi issue ke kaaran yeh request poora nhi hua. Kripya thodi baad try karein ya fir humare support team se chat karein @{{ supportBotUsername }}. 24/7 online.'
}
