import { BotCommand } from 'chats/types'

export const signupAR = {
  'choose-language': `مرحبا!

 يمكنك استخدام هذا الروبوت لتبادل العملات الأجنبية محليًا بعملتك.

 للبدء ، اختر لغتك * من الخيارات أدناه.`,

  'terms-and-conditions': `اقرأ [شروط الخدمات] (https://telegra.ph/Terms-of-Service-06-18) ، لمتابعة النقر على ✔️ * أوافق *.`,

  'terms-agree-button': ' أنا أوافق ✔️',

  'select-currency': 'اختر عملتك المحلية.',

  'account-ready': `* تم إنشاء الحساب! * ✅

  معرف الحساب: ${BotCommand.ACCOUNT} {{accountID}}
  عنوان BTC: * {{bitcoinAddress}} *

   للأمان ، يرجى تمكين التحقق بخطوتين في الإعدادات> الخصوصية والأمان 🔐`,

  'account-ready-generating-address': `* تم إنشاء الحساب! *  ✅

  معرف الحساب: ${BotCommand.ACCOUNT} {{accountID}}
  عنوان BTC: * {{bitcoinAddress}} *

  للأمان ، يرجى تمكين التحقق بخطوتين في الإعدادات> الخصوصية والأمان. 🔐`,
  'account-ready-continue-button': '🚀 ابدأ التداول',
  'home-screen': `🔷  *Megadeals*

  استخدم التبادل للعثور على صفقات أو محفظة لسحب أو إيداع BTC.`,
  'signup-error':
    'آسف! حدث خطأ أثناء التسجيل. اتصل بنا @ {{supportBotUsername}}. دعم 24/7.'
}
