export const accountEN = {
  'account-home': `👤  *My Account*
    
Account ID: /u{{ accountID }}

💵  *Total Deals:* {{ dealCount }}
💎  *Volume:*        {{ tradeVolume }} {{ cryptoCurrencyCode }}
🕒  *Avg speed:*   {{ tradeSpeed }}
⭐  *Rating:*           {{ ratingPercentage }}% 👍({{ upvotes }}) 👎({{ downvotes }})

🤝 Invited:           {{ referralCount }} users
💰 Earnings:        {{ earnings }} {{ cryptoCurrencyCode }}

💳  *Payment Methods:* {{ paymentMethods }}
`,

  'manage-payment-methods-cbbutton': '💳  Payment Methods',
  'add-payment-method-cbbutton': '➕  Add payment Method',
  'edit-payment-method-cbbutton': '🖋  Edit payment Methods',
  'verify-account-cbbutton': '✅  Verify Account',
  'referral-link-cbbutton': '🤝  Referral',
  'settings-cbbutton': '⚙ Settings',
  'referral-info-button': `🤝 *Referral*

* Invited*: {{ referralCount }} users
* Referral fees*: {{ referralFeesPercentage }}% 
_(from the fees we take from your referral)_

💰Invite your friends using your referral link to earn bitcoins from their transactions.
Payouts are processed *every day*, credited directly to your wallet.
`,

  'account-no-payment-method': `None`,

  'payment-method-none': `⚠️ You dont have any payment methods added.`,

  'payment-methods-show': `💳 *Payment Methods*

{{ paymentMethodsList }}
`,

  'edit-payment-method-show': `
*Edit Payment Method*

Click on the payment method you want to edit.
`,

  'add-payment-method-select': `*Select*

Select your payment method to add from the options below.
`,
  'payment-method-does-not-exist': `❌ *Error*

This payment method does not exist.

You can request @{{ supportBotUsername }} to get a valid payment method added.`,
  'edit-payment-method-enter-field': 'Enter the *{{ fieldName }}*',
  'payment-method-create-error':
    'Could not create this payment method. Please try again later.',
  'payment-method-created': `✅ *Created*

Your payment method was created.

{{ paymentMethodInfo }}
`,
  'payment-method-updated': `✅ *Updated*

Your payment method was updated.

{{ paymentMethodInfo }}
`,

  'settings-show': `*⚙ Settings*

Select the option you want to edit
`,
  'settings-currency-cbbutton': '💵  Currency',
  'settings-language-cbbutton': '🌎  Language',
  'settings-rate-source-cbbutton': '📊  Rate source',
  'settings-username-cbbutton': '👤  Change Acc ID',

  'settings-currency-show': `💵 *Currency*
  
Click to change your currency.

Active «*{{ fiatCurrencyCode }}*»`,
  'settings-currency-updated': `✅ *Updated*
  
Your currency was updated to *{{ updatedCurrencyCode }}*`,

  'settings-rate-source-show': `📊 *Rate source*

Select the exchange rate source you want to use.
Active «*{{ exchangeSource }}*»

⚠️ Changing this will affect your active orders if a margin pricing was used.
`,
  'settings-username-show': `👤 *Enter Account ID*

Only english letters and numbers between 3 and 15 characters.

NOTE: This action is final, you wont be able to change your Account ID again.
`,
  'settings-username-invalid': `❌ *Error*
  
Invalid Account ID. Please try again later.`,
  'settings-language-show': `🌎 *Language*

Choose your language.

Active «*{{ language }}*»
`,

  'back-to-settings-cbbutton': '⬅️  Back',
  'show-more': 'more »',
  'settings-updated': 'updated!'
}
