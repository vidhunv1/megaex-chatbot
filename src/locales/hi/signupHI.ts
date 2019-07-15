import { BotCommand } from 'chats/types'

export const signupHI = {
  'choose-language': `Hello!

You can use this bot to exchange bitcoins locally in your currency. आप इस बॉट का उपयोग अपनी मुद्रा में स्थानीय स्तर पर बिटकॉइन को एक्सचेंज करने के लिए कर सकते हैं।

To get started, choose your *language* from options below.`,

  'terms-and-conditions': `हमारी [सेवा की शर्तें] पढ़ें(https://telegra.ph/Terms-of-Service-06-18), जारी रखने के लिए ✔️ *मुझे स्वीकार है* पर क्लिक करें`,

  'terms-agree-button': '✔️ मुझे स्वीकार है',

  'select-currency': 'अपनी स्थानीय मुद्रा का चयन करें.',

  'account-ready': `✅  *खाता बन गया है!*

खाता आइडी: ${BotCommand.ACCOUNT}{{ accountID }}
BTC अद्द्रेस्स्: *{{ bitcoinAddress }}*

🔐 अपनी सुरक्षा के लिए कृपया सेटिंग > प्राइव़ॅसि और सेटिंग्स में 2-चरणीय सत्यापन सक्षम करें`,

  'account-ready-generating-address': `✅  *खाता बन गया है!*

खाता आइडी: ${BotCommand.ACCOUNT}{{ accountID }}
BTC अद्द्रेस्स्: *{{ bitcoinAddress }}*

🔐 अपनी सुरक्षा के लिए कृपया सेटिंग > प्राइव़ॅसि और सेटिंग्स में 2-चरणीय सत्यापन सक्षम करें`,
  'account-ready-continue-button': '🚀 ट्रेडिंग शुरू करें',
  'home-screen': `🔷  *Megadeals*

BTC को वापस लेने या जमा करने के लिए *वॉलेट* और ट्रेड् खोजने के लिए *एक्सचेंज* का उपयोग करें।`,
  'signup-error':
    'माफ़ कीजिये! खाता बनाते समय एक त्रुटि हुई। हमसे संपर्क करें @{{ supportBotUsername }}। 24/7 समर्थन करते हैं।'
}
