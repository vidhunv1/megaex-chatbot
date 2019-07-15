import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountEN = {
  home: {
    'passport-data-received': `✅ *Identity received*

Your verification documents has been received. This should be processed in 3 working hours. We will inform you when it's processed.`,
    'trade-message': `View trade ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 Write message',
    'send-response-cbbutton': '📝 Write response',
    'message-sent': 'Message sent!',
    'new-photo-message': `📨 <b>Message from</b> ${
      BotCommand.ACCOUNT
    }{{ accountId }}
{{ tradeInfo }}
Received photo`,
    'message-not-sent': '❗️ Failed to send.',
    'enter-message': 'Enter the message for the user. (max. 400 chars)',
    'new-message': `📨 <b>Message from</b> ${BotCommand.ACCOUNT}{{ accountId }}

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ back',
    'more-cbbutton': 'more »',
    'no-reviews-available': 'No reviews yet.',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *Review for* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

By *{{ reviewerName }}*. Traded for {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'Could not find this account.'
    },
    account: `👤  *My Account*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *Total Deals:* {{ dealCount }}
💎 Volume: {{ tradeVolume }}
⭐ Rating: {{ rating }}

🤝 Referrals Invited: {{ referralCount }} users
💰 Referral Earnings: {{ earnings }}

💳 *Payment Methods:* {{ paymentMethods }}`,

    'dealer-account': `*Account details* (${BotCommand.ACCOUNT}{{ accountId }})

[Contact {{ firstName }}](tg://user?id={{ telegramUserId }})

💵 Trade Deals: {{ dealCount }}
💎 Trade volume: {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ Rating: {{ rating }}`,

    'user-reviews-cbbutton': '🗣 Reviews ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️ Block user',
    'unblock-dealer-cbbutton': 'Unblock user',
    'verify-account-cbbutton': '🆔 Verify KYC',
    'manage-payment-methods-cbbutton': '💳 Payment Methods',
    'referral-link-cbbutton': '🤝 Referral',
    'settings-cbbutton': '️⚙️ Settings',
    'no-payment-method': `None`
  },

  'payment-method': {
    'does-not-exist': `❗️  *Invalid payment method*

This payment method does not exist.

You can request @{{ supportBotUsername }} to get a valid payment method added.`,

    'create-error':
      'Sorry. We could not create this payment method. Please try again later.',
    'edit-cbbutton': '🖋  Edit payment methods',
    'add-cbbutton': '➕  Add payment method',
    'show-all': `💳 *Payment Methods*

{{ paymentMethodsList }}`,
    'show-edit': `*Edit Payment Method*

Click on the payment method you want to edit.`,
    'select-to-add': `*Select*

Select your payment method to add from the options below.`,
    'edit-enter-field': 'Enter the *{{ fieldName }}*',
    created: `✅ Payment method *added*

Your payment method is added.

{{ paymentMethodInfo }}
You can now use this to receive money when selling {{ cryptoCurrencyCode }}.`,
    updated: `✅ *Payment method updated*

Your payment method is updated.

{{ paymentMethodInfo }}`,
    'none-added': `No payment methods added. They are used to transfer money to you when you are selling.`
  },

  referral: {
    'show-info': `🤝  *Refer and Earn*

Your referral count: {{ referralCount }} users
Referral fees: {{ referralFeesPercentage }}%

Earn bitcoins with every trade your referral makes. You will get {{ referralFeesPercentage }}% of the trade fee.

For example: If your referral trades 1 BTC you will make 0.004 BTC of the 0.008 BTC we take as fee.

Processed and credited instantly to your wallet. No limitations and no expiry date.

Copy the message below and share it. 👇`
  },

  settings: {
    'invalid-username': `❌ *Error*

This Account ID is invalid. Please check the ID you've entered and try again.`,

    'update-success': 'changed',
    'username-show': `👤 *Enter Account ID*

Only english letters and numbers between 3 and 15 characters.

NOTE: This action is final, you won't be able to change your Account ID again.
`,
    'back-to-settings-cbbutton': '⬅️ back',
    'settings-currency-updated': `Your currency is updated to *{{ updatedCurrencyCode }}*.`,
    'show-rate-source': `📊 *Rate source*

Select the exchange rate source you want to use.
Currently active: *{{ exchangeSource }}*.

Note: Changing this will affect your active orders if you have used margin pricing.
`,
    'show-more': 'more »',
    'show-currency': `💵 *Currency*

Click to change your currency.

You are currently using *{{ fiatCurrencyCode }}*. Select a currency. Click on "more" to see other available currencies.`,
    'show-language': `🌎 *Language*

Choose the language for the app.

Note: Old messages (sent and received) will not be changed to new language.

Currently active: *{{ language }}*`,
    'currency-cbbutton': '💵 Currency',
    'language-cbbutton': '🌎 Language',
    'rate-source-cbbutton': '📊 Rate source',
    'show-settings': `⚙️ Settings

What do you want to edit?`,
    'username-cbbutton': '👤  Change Account ID'
  }
}
