import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonEN = {
  'new-referral': `🤝 *New Referral*

${BotCommand.ACCOUNT}{{ accountId }} joined through your referral link. 

You will now receive comissions from all their trades.`,
  'callback-error-response': '❗️Error',
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

ℹ️ *About MegaDeals:*

MegaDeals is a secure bot to best deals to buy/sell bitcoins with your local currency.`
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
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS bank transfer'
    },
    'short-names': {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS'
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
        field2: 'Account Number',
        field3: 'IFSC Code'
      }
    }
  },
  'show-transactions-title': `📗 *Transactions*

*Coin*        *Amount*               *Type*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
