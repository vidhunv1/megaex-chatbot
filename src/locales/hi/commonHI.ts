import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonHI = {
  group: {
    'limit-updated': 'अद्यतन सीमा!',
    unauthorized: 'केवल चैट आडमिन ही इस आदेश का उपयोग कर सकते हैं।',
    'invalid-limit-number': 'setDailyLimit का मान 0-24 के बीच होना चाहिए।',
    'special-message': `❕ आप इस बॉट को अपने समूह या चैनल में जोड़ सकते हैं और अब BTC कमा सकते हैं।
[ज़्यादा पढ़ने के लिए यहां क्लिक करें](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*Hello*

मैं यहां BTC रेट अलर्ट भेजना शुरू करूंगा।

*Commands*
[/rate - बीटीसी के लिए वर्तमान बाजार दर प्राप्त करें]
[/setDailyLimit 6] - प्रति दिन भेजने के लिए दर अलर्ट की संख्या निर्धारित करें। मान 0 - 24 होना चाहिए। (केवल आडमिन के लिए उपलब्ध)`,
    'account-linked': `❕ यह बॉट [{{ telegramName }}](tg://user?id={{ telegramUserId }}) के खाते पर  @{{ botUsername }} से जुड़ा हुआ है।`,
    'account-not-linked':
      '❕इस समूह से कोई खाता लिंक नहीं है। [{{ telegramName }}](tg://user?id={{ telegramUserId }}) मुझे मेसेज कर सकते हैं @{{ botUsername }} या खाता बनाने और लिंक करने के लिए नीचे दिए गए बटन पर क्लिक करें।',
    'exchange-btc': '📊 BTC खरीदें / बेचें',
    'rate-alert-up': `*दर जानकारी*

🚀 BTC अंतिम घंटे में *{{ change1h }}%* ऊपर गया है और मूल्य *{{ formattedRate }}* है।

----------------
24h व्यापार मात्रा: {{ formattedVolume24h }}
24h परिवर्तन: {{ change24h }}%
7d परिवर्तन: {{ change7d }}%
----------------`,
    'rate-alert-down': `*Rate alert*

🎢 BTC अंतिम घंटे में *{{ change1h }}%* नीचे गया है और मूल्य *{{ formattedRate }}* है।

----------------
24h व्यापार मात्रा: {{ formattedVolume24h }}
24h परिवर्तन: {{ change24h }}%
7d परिवर्तन: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *MegaX*

_बिटकॉइन को अपनी मुद्रा में स्थानीय रूप से एक्सचेंज करने का तेज़ और सरल तरीका।_
https://megax.in

*स्टेटस*: ऑनलाइन
*शुल्क वापस लें*: {{ btcWithdrawalFee }}
*न्यूनतम निकासी*: {{ btcWithdrawalMin }}
*टैकर शुल्क*: {{ takerFeePercentage }}% (खरीद / बिक्री ट्रेड् के लिए शुल्क)
*निर्माता शुल्क*: {{ makerFeePercentage }}%
*रेफरल कमीशन*: {{ referralComission }}% कुल व्यापार शुल्क का।`,
    'join-group-cbbutton': '📣 MegaX घोषणा चैनल',
    'referral-cbbutton': '🤝 रेफरल को आमंत्रित करें',
    'verify-account-cbbutton': '🆔 KYC सत्यापित करें',
    'guide-cbbutton': '📖 इस्तेमाल करना',
    'support-cbbutton': '👨‍💼 समर्थन'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 *आडमिन से संदेश*',
    'support-message-title': '👩‍💼 *सहयोग टीम से संदेश*',
    'system-message-title': '🤖 *सिस्टम संदेश*'
  },
  'new-referral': `🤝 *नया रेफरल*,

${BotCommand.ACCOUNT}{{ accountId }} आपके रेफ़रल लिंक के माध्यम से जुड़ गया।

अब आप उनके सभी ट्रेडों से कमीशन प्राप्त करेंगे।`,
  'callback-error-response': '❗️ त्रुटि',
  'contact-legal-cbbutton': '👩‍🎓 हमसे संपर्क करें',
  'contact-legal': `👩‍🎓 *ग्राहक सहेयता*

अपने ट्रेडों या अपने ट्रेडों / आदेशों के साथ किसी भी विवाद से संबंधित मुद्दों के लिए संपर्क करें (अपने व्यापार आईडी या अन्य जानकारी को अपने मुद्दे को जल्दी से हल करने के लिए शामिल करें)।

मेसेज भेजें: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 सहयोग टीम',
  'contact-support': `👨‍💼 *ग्राहक सहेयता*

यदि आपको सेवा से संबंधित सहायता की आवश्यकता है। आप सेवा से संबंधित किसी भी समस्या, बग या प्रतिक्रिया की रिपोर्ट कर सकते हैं।

मेसेज भेजें: @{{ supportUsername }}
`,
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.KRAKEN]: 'Kraken'
  },
  updated: 'अपडेट किया गया!',
  'cryptocurrency-names': {
    BTC: 'Bitcoin'
  },
  cancel: 'रद्द करें',
  actions: {
    'cancel-keyboard-button': 'रद्द करें',
    'back-inline-button': '« वापस',
    'more-inline-button': 'अगला'
  },
  'action-canceled': 'इसे रद्द कर दिया गया।',
  error: {
    unknown:
      '❗️❗️ एक त्रुटि पाई गई। हम इस पर काम कर रहे हैं। बाद में पुन: प्रयास करें।',
    'bad-message': `👮‍ *MegaDeals सपोर्ट टीम:*

यदि आपको कोई परेशानी हो रही है, तो हम आपकी सहायता के लिए 24/7 हैं। हमारी टीम से संपर्क करें @{{ supportBotUsername }}

⚠️ महत्वपूर्ण: इस बॉट के बाहर कभी कोई सौदा न करें, हम आपके फंड की सुरक्षा और पुनर्प्राप्ति नहीं कर पाएंगे।

ℹ️  *MegaDeals के बारे में:*

MegaDeals आपके स्थानीय मुद्रा के साथ बिटकॉइन खरीदने / बेचने के लिए एक सुरक्षित एक्सचेंज बॉट है।`
  },
  bot: {
    name: 'BTC Deals',
    support: {
      name: 'BTC Deals support'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: 'खरीदें',
      [OrderType.SELL]: 'बेचें'
    }
  },
  'main-menu': {
    exchange: '💵 एक्सचेंज BTC-{{ fiatCurrency }}',
    account: '👤 मेरा खाता',
    wallet: '💼 वॉलेट',
    info: '🔷 जानकारी'
  },
  'unhandled-callback': `माफ़ कीजिये! इस अनुरोध पर आपका सत्र समाप्त हो गया है। कृपया फिर से एक नया अनुरोध करें।`,
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
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'नेशनल बैंक ट्रांसफर',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'नकद व्यापार',
      [PaymentMethodType.CASH_DEPOSIT]: 'नकद जमा',
      [PaymentMethodType.CREDIT_CARD]: 'क्रेडिट कार्ड',
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
      [PaymentMethodType.OTHER]: 'Other'
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
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'नेशनल बैंक ट्रांसफर',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'नकद व्यापार',
      [PaymentMethodType.CASH_DEPOSIT]: 'नकद जमा',
      [PaymentMethodType.CREDIT_CARD]: 'क्रेडिट कार्ड',
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
      [PaymentMethodType.OTHER]: 'Other'
    },
    fields: {
      [PaymentMethodType.PAYTM]: {
        field1: 'मोबाइल नंबर'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI आईडी'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: 'बैंक का नाम',
        field2: 'खाता संख्या',
        field3: 'IFSC कोड'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: 'पूर्ण भुगतान विवरण'
      },
      [PaymentMethodType.QIWI]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.WECHAT]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: 'बैंक का नाम',
        field2: 'खाता विवरण'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: 'ईमेल'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: 'स्थान / शहर'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.SKRILL]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.OKPAY]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.PAXUM]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: 'भुगतान विवरण'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Altcoin ticker name',
        field2: 'Altcoin address'
      },
      [PaymentMethodType.OTHER]: {
        field1: 'पूर्ण भुगतान विवरण'
      }
    }
  },
  'show-transactions-title': `📗 *Transactions*

*कॉइन*        *राशि*               *प्रकार*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
