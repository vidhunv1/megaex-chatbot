import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountEN = {
  home: {
    'back-cbbutton': '⬅️ back',
    'more-cbbutton': 'more »',
    'no-reviews-available': 'No reviews yet',
    'user-review': `({{ currentPage }}/{{ totalPages }}) Review for ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}

*{{ reviewerName }}* had completed a deal for {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'Could not find this account.'
    },
    account: `👤  *My Account*
    
Account ID: ${BotCommand.ACCOUNT}{{ accountID }}
    
💵  *Total Deals:* {{ dealCount }}
💎  *Volume:*        {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐  *Rating:*           {{ rating }}
    
🤝 Invited:           {{ referralCount }} users
💰 Earnings:        {{ earnings }} {{ cryptoCurrencyCode }}
    
💳  *Payment Methods:* {{ paymentMethods }}`,

    'dealer-account': `*Account* (${BotCommand.ACCOUNT}{{ accountId }})

Telegram: @{{ telegramUsername }}

💵  *Total Deals:* {{ dealCount }}
💎  *Volume:*       {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐  *Rating:*         {{ rating }}`,

    'send-message-dealer-cbbutton': '📝 Write message',
    'user-reviews-cbbutton': '🗣 Reviews ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️  Block user',
    'unblock-dealer-cbbutton': 'Unblock user',
    'verify-account-cbbutton': '✅  Verify identity',
    'manage-payment-methods-cbbutton': '💳  Payment Methods',
    'referral-link-cbbutton': '🤝  Referral',
    'settings-cbbutton': '⚙ Settings',
    'no-payment-method': `None`
  },

  'payment-method': {
    'does-not-exist': `❌ *Error*

    This payment method does not exist.
    
    You can request @{{ supportBotUsername }} to get a valid payment method added.`,

    'create-error':
      'Could not create this payment method. Please try again later.',
    'edit-cbbutton': '🖋  Edit payment Methods',
    'add-cbbutton': '➕  Add payment Method',
    'show-all': `💳 *Payment Methods*

{{ paymentMethodsList }}`,
    'show-edit': `
*Edit Payment Method*

Click on the payment method you want to edit.
`,
    'select-to-add': `*Select*

Select your payment method to add from the options below.
`,
    'edit-enter-field': 'Enter the *{{ fieldName }}*',
    created: `✅ *Created*

Your payment method was created.

{{ paymentMethodInfo }}

❕You can now use this to receive money when selling cryptocurrency.`,
    updated: `✅ *Updated*

Your payment method was updated.

{{ paymentMethodInfo }}
`,
    'none-added': `❕ You dont have any payment methods added. This will be used to transfer money to you when you are selling.`
  },

  referral: {
    'show-info': `🤝 *Referral*

* Invited*: {{ referralCount }} users
* Referral fees*: {{ referralFeesPercentage }}% 
_(from the fees we take from your referral)_
    
💰Invite your friends using your referral link to earn bitcoins from their transactions.
Payouts are processed *every day*, credited directly to your wallet.`
  },

  settings: {
    'invalid-username': `❌ *Error*
  
Invalid Account ID. Please try again later.`,

    'update-success': 'changed',
    'username-show': `👤 *Enter Account ID*

Only english letters and numbers between 3 and 15 characters.

NOTE: This action is final, you wont be able to change your Account ID again.
`,
    'back-to-settings-cbbutton': '⬅️  Back',
    'settings-currency-updated': `✅ *Updated*
  
Your currency was updated to *{{ updatedCurrencyCode }}*`,
    'show-rate-source': `📊 *Rate source*

Select the exchange rate source you want to use.
Active «*{{ exchangeSource }}*»

⚠️ Changing this will affect your active orders if a margin pricing was used.
`,
    'show-more': 'more »',
    'show-currency': `💵 *Currency*
  
Click to change your currency.

Active «*{{ fiatCurrencyCode }}*»`,
    'show-language': `🌎 *Language*

Choose your language.

Active «*{{ language }}*»
`,
    'currency-cbbutton': '💵  Currency',
    'language-cbbutton': '🌎  Language',
    'rate-source-cbbutton': '📊  Rate source',
    'show-settings': `*⚙ Settings*

Select the option you want to edit
`,
    'username-cbbutton': '👤  Change Acc ID'
  }
}
