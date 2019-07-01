import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonEN = {
  notifications: {
    'admin-message-title': '👨‍🚀 *Message from admin*',
    'support-message-title': '👩‍💼 *Message from support*',
    'system-message-title': '🤖 *System message*'
  },
  'new-referral': `🤝 *New Referral*

${BotCommand.ACCOUNT}{{ accountId }} joined through your referral link. 

You will now receive commissions from all their trades.`,
  'callback-error-response': '❗️ Error',
  'contact-legal-cbbutton': '👩‍🎓 Contact Support',
  'contact-legal': `👩‍🎓 *Customer support*

Contact for issues related to your trade or any disputes with your trades/orders (include your trade id or other information to resolve your issue quickly).

Send message: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 Contact Support',
  'contact-support': `👨‍💼 *Customer support*

If you need support related to the service. You can report any issues, bugs or feedback related to the service.

Send message: @{{ supportUsername }}
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
  cancel: 'cancel',
  actions: {
    'cancel-keyboard-button': 'cancel',
    'back-inline-button': '« back',
    'more-inline-button': 'more'
  },
  'action-canceled': 'This action was canceled.',
  error: {
    unknown:
      '❗️❗️ Oops! An error occurred. We are working on this. Please try again later.',
    'bad-message': `👮‍ *MegaDeals Support Team:*

If you are having any trouble, we are there to help you 24/7. Contact our team @{{ supportBotUsername }}

⚠️ IMPORTANT: Never do any deals outside this bot, we will not be able to protect and recover your funds.

ℹ️  *About MegaDeals:*

MegaDeals is a secure p2p exchange bot to buy / sell bitcoins with your local currency. `
  },
  bot: {
    name: 'BTC Deals',
    support: {
      name: 'BTC Deals support'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: 'Buy',
      [OrderType.SELL]: 'Sell'
    }
  },
  'main-menu': {
    exchange: '💵 Exchange BTC-{{ fiatCurrency }}',
    account: '👤 My Account',
    wallet: '💼 Wallet'
  },
  'unhandled-callback': `Sorry! Your session on this request has expired. Please make a new request again.`,
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
      [PaymentMethodType.WECHAT]: 'WeChay',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'National Bank Transfer',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Cash trade',
      [PaymentMethodType.CASH_DEPOSIT]: 'Cash deposit',
      [PaymentMethodType.CREDIT_CARD]: 'Credit card',
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
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'National Bank Transfer',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Cash trade',
      [PaymentMethodType.CASH_DEPOSIT]: 'Cash deposit',
      [PaymentMethodType.CREDIT_CARD]: 'Credit card',
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
        field1: 'Mobile number'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI ID'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: 'Bank name',
        field2: 'Account number',
        field3: 'IFSC code'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: 'Complete payment details'
      },
      [PaymentMethodType.QIWI]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.WECHAT]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: 'Bank name',
        field2: 'Account details'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: 'Email'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: 'Location / city'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.SKRILL]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.OKPAY]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.PAXUM]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: 'Payment details'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Altcoin ticker name',
        field2: 'Altcoin address'
      },
      [PaymentMethodType.OTHER]: {
        field1: 'Full payment details'
      }
    }
  },
  'show-transactions-title': `📗 *Transactions*

*Coin*        *Amount*               *Type*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
