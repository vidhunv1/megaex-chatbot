import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonEN = {
  group: {
    'limit-updated': 'updated limit!',
    unauthorized: 'Only chat admins can use this command.',
    'invalid-limit-number':
      'The value for setDailyLimit should be between 0-24.',
    'special-message': `❕ You can add this bot to your groups or channels and earn BTC now.
[Click here to read more](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*Hello*

I will start sending BTC rate alerts here.

*Commands*
[/rate - Get current market rate for BTC]
[/setDailyLimit 6] - Set the number of rate alerts to send per day. Value should be 0 - 24. (Only available to admins)`,
    'account-linked': `❕This bot is linked to [{{ telegramName }}](tg://user?id={{ telegramUserId }})'s account on @{{ botUsername }}.`,
    'account-not-linked':
      '❕There is no account linked to this group. [{{ telegramName }}](tg://user?id={{ telegramUserId }}) can PM me at @{{ botUsername }} or click button below to create and link account.',
    'exchange-btc': '📊 Buy / Sell BTC',
    'rate-alert-up': `*Rate alert*

🚀 BTC is up *{{ change1h }}%* in the last hour at *{{ formattedRate }}*.

----------------
24h Volume: {{ formattedVolume24h }}
24h change: {{ change24h }}%
7d change: {{ change7d }}%
----------------`,
    'rate-alert-down': `*Rate alert*

🎢 BTC is down *{{ change1h }}%* in the last hour at *{{ formattedRate }}*.

----------------
24h Volume: {{ formattedVolume24h }}
24h change: {{ change24h }}%
7d change: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *Megadeals*

_The fast and simple way to exchange bitcoins locally in your currency._
https://megadeals.io

*Status*: Online
*BTC withdrawal*: {{ btcWithdrawalFee }}
*Taker fee*: {{ takerFeePercentage }}% (Fee for quick buy / quick sell trades)
*Maker fee*: {{ makerFeePercentage }}%
*Referral comission*: {{ referralComission }}% of the total trade fee.`,
    'join-group-cbbutton': '👥 Join our community',
    'referral-cbbutton': '🤝 Invite referral',
    'verify-account-cbbutton': '🆔 Verify KYC',
    'guide-cbbutton': '📖 How to use?',
    'support-cbbutton': '👨‍💼 Support'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 *Message from admin*',
    'support-message-title': '👩‍💼 *Message from support*',
    'system-message-title': '🤖 *System message*'
  },
  'new-referral': `🤝 *New Referral*,

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
    wallet: '💼 Wallet',
    info: '🔷 Info'
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
      [PaymentMethodType.WECHAT]: 'WeChat',

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
