import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountEN = {
  home: {
    'trade-message': `View trade ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 Write message',
    'send-response-cbbutton': '📝 Write response',
    'message-sent': 'message sent!',
    'new-photo-message': `📨 <b>Message from</b> ${
      BotCommand.ACCOUNT
    }{{ accountId }}
{{ tradeInfo }}
Received photo`,
    'message-not-sent': '❌ Could not send this message',
    'enter-message':
      'input your message to send the user (text should be less than 400 characters)',
    'new-message': `📨 <b>Message from</b> ${BotCommand.ACCOUNT}{{ accountId }}

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ back',
    'more-cbbutton': 'more »',
    'no-reviews-available': 'No reviews yet',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *Review for* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

By *{{ reviewerName }}*, traded for {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'Could not find this account.'
    },
    account: `👤  *My Account*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *Total Deals:* {{ dealCount }}
💎 *Volume:* {{ tradeVolume }}
⭐ *Rating:* {{ rating }}

🤝 Referrals Invited: {{ referralCount }} users
💰 Referral Earnings: {{ earnings }}

💳 *Payment Methods:* {{ paymentMethods }}`,

    'dealer-account': `*Account* (${BotCommand.ACCOUNT}{{ accountId }})

Telegram: @{{ telegramUsername }}

💵 *Trade Deals:* {{ dealCount }}
💎 *Trade volume:* {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ *Rating:* {{ rating }}`,

    'user-reviews-cbbutton': '🗣 Reviews ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️  Block user',
    'unblock-dealer-cbbutton': 'Unblock user',
    'verify-account-cbbutton': '🆔 Verify identity',
    'manage-payment-methods-cbbutton': '💳  Payment Methods',
    'referral-link-cbbutton': '🤝  Referral',
    'settings-cbbutton': '️⚙️ Settings',
    'no-payment-method': `None`
  },

  'payment-method': {
    'does-not-exist': `❌ *Error*

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
❕You can now use this to receive money when selling cryptocurrency.`,
    updated: `✅ Payment method *updated*.

Your payment method is updated.

{{ paymentMethodInfo }}`,
    'none-added': `❕ You dont have any payment methods added. This will be used to transfer money to you when you are selling.`
  },

  referral: {
    'show-info': `🤝 *Refer your friends*

*Your referral count*: {{ referralCount }} users
*Referral fees*: {{ referralFeesPercentage }}%
_(% commission you receive from the fees we take from your referral)_

Invite new users using your referral link and earn bitcoins. For every trade your referral makes, you will get {{ referralFeesPercentage }}% of the trade fee.

For example: If your referral trades 1 BTC you will make 0.004 BTC of the 0.008 BTC we take as fee.

💰 Your referral payouts are processed instantly credited directly to your wallet. The referral program has no expiry date, and no limits of invitations.

Copy the message below and share it. 👇`
  },

  settings: {
    'invalid-username': `❌ *Error*

This Account ID is invalid. Please check the ID you've entered and try again.`,

    'update-success': 'changed',
    'username-show': `👤 *Enter Account ID*

Only english letters and numbers between 3 and 15 characters.

NOTE: This action is final, you wont be able to change your Account ID again.
`,
    'back-to-settings-cbbutton': '⬅️  Back',
    'settings-currency-updated': `✅ Your currency is updated to *{{ updatedCurrencyCode }}*`,
    'show-rate-source': `📊 *Rate source*

Select the exchange rate source you want to use.
The exchange source active is: *{{ exchangeSource }}*.

⚠️ Note: Changing this will affect your active orders if you had used *margin pricing*.
`,
    'show-more': 'more »',
    'show-currency': `💵 *Currency*

Click to change your currency.

You are currently using *{{ fiatCurrencyCode }}*. Select a currency from the list below. Click on "more" to see other available currencies.`,
    'show-language': `🌎 *Language*

Choose the language for the app.

Tip:
1. Use a language you can understand and read well.
2. The previous messages (sent and received) will not be changed to your new language.

Active «*{{ language }}*»`,
    'currency-cbbutton': '💵 Currency',
    'language-cbbutton': '🌎 Language',
    'rate-source-cbbutton': '📊 Rate source',
    'show-settings': `⚙️ *Settings*

What do you want to edit?`,
    'username-cbbutton': '👤  Change Acc ID'
  }
}
