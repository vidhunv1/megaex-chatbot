import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonAR = {
  group: {
    'limit-updated': 'الحد المحدث!',
    unauthorized: 'يمكن فقط لمسؤولي الدردشة استخدام هذا الأمر.',
    'invalid-limit-number': 'يجب أن تكون قيمة setDailyLimit بين 0-24.',
    'special-message': `يمكنك إضافة هذا الروبوت إلى مجموعاتك أو قنواتك وكسب BTC الآن. ❕
[انقر هنا لقراءة المزيد](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*مرحبا*

سأبدأ في إرسال تنبيهات بشأن معدل BTC هنا.

*الأوامر*
[الحصول على سعر السوق الحالي ل BTC - /rate]
اضبط عدد تنبيهات الأسعار المراد إرسالها يوميًا. يجب أن تكون القيمة 0 - 24. (متاح فقط للمشرفين) - [/setDailyLimit 6]`,
    'account-linked': `هذا الروبوت مرتبط بحساب [{{ telegramName }}](tg://user?id={{ telegramUserId }}) على @{{botUsername}}. ❕`,
    'account-not-linked':
      'لا يوجد حساب مرتبط بهذه المجموعة. يمكن [{{ telegramName }}](tg://user?id={{ telegramUserId }}) PM لي في @{{ botUsername }} أو انقر فوق الزر أدناه لإنشاء وربط الحساب.',
    'exchange-btc': '📊  شراء / بيع BTC',
    'rate-alert-up': `*تنبيه معدل*

 🚀 ارتفع BTC *{{ change1h }}%* في الساعة الأخيرة في *{{ formattedRate }}*

----------------
حجم 24h: {{ formattedVolume24h }}
24 ساعة التغيير: {{ change24h }}%
التغيير 7D: {{ change7d }}%
----------------`,
    'rate-alert-down': `*تنبيه معدل*

 🎢 انخفض BTC *{{ change1h }}%* في الساعة الأخيرة في *{{ formattedRate }}*

----------------
حجم 24h: {{ formattedVolume24h }}
24 ساعة التغيير: {{ change24h }}%
التغيير 7D: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *Megadeals*

_طريقة سريعة وبسيطة لتبادل عملات البيتكوين محليًا بعملتك._
https://megadeals.io

*الحالة*: عبر الانترنت
*انسحاب BTC*: {{ btcWithdrawalFee }}
*رسوم الاخذ*: {{ takerFeePercentage }}% (رسوم شراء سريع / بيع سريع)
*رسوم صانع*: {{ makerFeePercentage }}%
*لجنة الإحالة*: {{ referralComission }}% من إجمالي رسوم التجارة.`,
    'join-group-cbbutton': '👥  انضم إلى مجتمعنا',
    'referral-cbbutton': '🤝 دعوة الإحالة',
    'verify-account-cbbutton': '🆔 التحقق',
    'guide-cbbutton': '📖 كيف تستعمل؟',
    'support-cbbutton': '👨‍💼 الدعم'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 * رسالة من المشرف *',
    'support-message-title': '👩‍💼 * رسالة من الدعم *',
    'system-message-title': '🤖 * رسالة النظام *'
  },
  'new-referral': `🤝 * إحالة جديدة *,

انضم ${BotCommand.ACCOUNT}{{ accountId }} من خلال رابط الإحالة الخاص بك.

سوف تتلقى الآن عمولات من جميع تداولاتها.`,
  'callback-error-response': '❗️ خطأ',
  'contact-legal-cbbutton': '👩‍🎓 اتصل بالدعم',
  'contact-legal': `👩‍🎓 *دعم العملاء*

اتصل بالمشكلات المتعلقة بالتداول أو أي نزاعات مع تداولاتك / طلباتك (بما في ذلك معرف التجارة الخاص بك أو معلومات أخرى لحل مشكلتك بسرعة)

إرسال رسالة: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 اتصل بالدعم',
  'contact-support': `👨‍💼 *دعم العملاء*

إذا كنت بحاجة إلى دعم يتعلق بالخدمة. يمكنك الإبلاغ عن أي مشاكل أو أخطاء أو تعليقات متعلقة بالخدمة.

إرسال رسالة: @{{ supportUsername }}
`,
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.KRAKEN]: 'Kraken'
  },
  updated: 'Updated!',
  'cryptocurrency-names': {
    BTC: 'Bitcoin'
  },
  cancel: 'إلغاء',
  actions: {
    'cancel-keyboard-button': 'إلغاء',
    'back-inline-button': 'الى الخلف «',
    'more-inline-button': 'أكثر من'
  },
  'action-canceled': 'تم إلغاء هذا الإجراء.',
  error: {
    unknown:
      '❗️❗️ وجه الفتاة! حدث خطأ. ونحن نعمل على ذلك. الرجاء معاودة المحاولة في وقت لاحق.',
    'bad-message': `👮‍ *فريق دعم MegaDeals*

إذا كنت تواجه أي مشكلة ، فنحن موجودون لمساعدتك على مدار الساعة طوال أيام الأسبوع. اتصل بفريقنا @{{ supportBotUsername }}

⚠️ هام: لا تفعل أي صفقات خارج هذا الروبوت ، فلن نتمكن من حماية واسترداد أموالك.

ℹ️ *حول MegaDeals*

MegaDeals عبارة عن روبوت آمن لتبادل العملات لشراء وبيع عملات البيتكوين بعملتك المحلية.`
  },
  bot: {
    name: 'عروض BTC',
    support: {
      name: 'عروض BTC الدعم'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: 'يشترى',
      [OrderType.SELL]: 'يبيع'
    }
  },
  'main-menu': {
    exchange: '💵  تبادل BTC-{{ fiatCurrency }}',
    account: '👤 حسابي',
    wallet: '💼 محفظة نقود',
    info: '🔷 معلومات'
  },
  'unhandled-callback': `آسف! انتهت جلستك بشأن هذا الطلب. يرجى تقديم طلب جديد مرة أخرى.`,
  'payment-methods': {
    names: {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS bank transfer',
      // RUB
      [PaymentMethodType.SBERBANK]: 'SberBank',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChat',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'حوالة مصرفية وطنية',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'تجارة النقد',
      [PaymentMethodType.CASH_DEPOSIT]: 'إيداع نقدي',
      [PaymentMethodType.CREDIT_CARD]: 'بطاقة الائتمان',
      [PaymentMethodType.SKRILL]: 'Skrill',
      [PaymentMethodType.OKPAY]: 'OkPay',
      [PaymentMethodType.WESTERN_UNION]: 'Western Union',
      [PaymentMethodType.WEBMONEY]: 'WebMoney',
      [PaymentMethodType.NETTELLER]: 'Netteller',
      [PaymentMethodType.INTERNATIONAL_WIRE]: 'International Wire',
      [PaymentMethodType.AMAZON_GIFT_CARD]: 'Amazon Gift card',
      [PaymentMethodType.PAXUM]: 'Paxum',
      [PaymentMethodType.PAYONEER]: 'Payoneer',
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 'Cryptocurrency altcoin',
      [PaymentMethodType.OTHER]: 'آخر'
    },
    'short-names': {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS',
      // RUB
      [PaymentMethodType.SBERBANK]: 'SberBank',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChay',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'حوالة مصرفية وطنية',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'تجارة النقد',
      [PaymentMethodType.CASH_DEPOSIT]: 'إيداع نقدي',
      [PaymentMethodType.CREDIT_CARD]: 'بطاقة الائتمان',
      [PaymentMethodType.SKRILL]: 'Skrill',
      [PaymentMethodType.OKPAY]: 'OkPay',
      [PaymentMethodType.WESTERN_UNION]: 'Western Union',
      [PaymentMethodType.WEBMONEY]: 'WebMoney',
      [PaymentMethodType.NETTELLER]: 'Netteller',
      [PaymentMethodType.INTERNATIONAL_WIRE]: 'International Wire',
      [PaymentMethodType.AMAZON_GIFT_CARD]: 'Amazon Gift card',
      [PaymentMethodType.PAXUM]: 'Paxum',
      [PaymentMethodType.PAYONEER]: 'Payoneer',
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 'Cryptocurrency altcoin',
      [PaymentMethodType.OTHER]: 'آخر'
    },
    fields: {
      [PaymentMethodType.PAYTM]: {
        field1: 'رقم الهاتف المحمول'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI ID'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: 'اسم البنك',
        field2: 'رقم حساب',
        field3: 'IFSC code'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: 'تفاصيل الدفع كاملة'
      },
      [PaymentMethodType.QIWI]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.WECHAT]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: 'اسم البنك',
        field2: 'تفاصيل الحساب'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: 'البريد الإلكتروني'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: 'الموقع / المدينة'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.SKRILL]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.OKPAY]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.PAXUM]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: 'بيانات الدفع'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Altcoin ticker name',
        field2: 'Altcoin address'
      },
      [PaymentMethodType.OTHER]: {
        field1: 'بيانات الدفع'
      }
    }
  },
  'show-transactions-title': `📗 *المعاملات*

*عملة*        *كمية*               *نوع*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
