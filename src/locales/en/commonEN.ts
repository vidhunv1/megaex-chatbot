import { PaymentMethods } from 'constants/paymentMethods'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models'

export const commonEN = {
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.BITMEX]: 'Bitmex'
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
      'An error occurred, we are working on fixing this. Please try again later.',
    'bad-message': `👮‍ *Support*

If you are having any trouble please contact our support @{{ supportBotUsername }}

⚠️ _Caution: Never do any deals outside this bot, we will not be able to protect and recover your funds_

*Info*

Here you can find best deals to exchange bitcoins with your local currency here

⚡️ Instant exchange with escrow protection
🔒 Secure wallet
`
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
  'unhandled-callback': `Session on this button expired. Please create a new request.`,
  'payment-methods': {
    names: {
      [PaymentMethods.PAYTM]: 'PayTM',
      [PaymentMethods.UPI]: 'UPI',
      [PaymentMethods.CASH]: 'Direct cash',
      [PaymentMethods.BANK_TRANSFER_IMPS_INR]: 'IMPS bank transfer'
    },
    'short-names': {
      [PaymentMethods.PAYTM]: 'PayTM',
      [PaymentMethods.UPI]: 'UPI',
      [PaymentMethods.CASH]: 'Direct cash',
      [PaymentMethods.BANK_TRANSFER_IMPS_INR]: 'IMPS'
    },
    fields: {
      [PaymentMethods.PAYTM]: {
        field1: 'Mobile number'
      },
      [PaymentMethods.UPI]: {
        field1: 'UPI ID'
      },
      [PaymentMethods.CASH]: {
        field1: 'location'
      },
      [PaymentMethods.BANK_TRANSFER_IMPS_INR]: {
        field1: 'Bank name',
        field2: 'Account Number',
        field3: 'IFSC Code'
      }
    }
  },
  'show-transactions-title': `📗 *Transactions*

      *Coin*        *Amount*           *Type*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
