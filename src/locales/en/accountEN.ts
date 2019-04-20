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

  'manage-payment-methods': '💳  Payment Methods',
  'add-payment-method': '➕  Add payment Method',
  'edit-payment-method': '🖋  Edit payment Methods',
  'verify-account': '✅  Verify Account',
  'referral-link': '🤝  Referrals',
  'referral-info': `🤝 *Referrals*

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
`
}
