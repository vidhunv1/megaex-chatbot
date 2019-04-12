export const accountEN = {
  'account-home': `👤  *My Account*
    
Account ID: /u{{ accountID }}

💵  *Total Deals:* {{ dealCount }}
💎  *Volume:*        {{ tradeVolume }} {{ cryptoCurrencyCode }}
🕒  *Avg speed:*   {{ tradeSpeed }}
⭐  *Rating:*           {{ ratingPercentage }}% 👍({{ upvotes }}) 👎({{ downvotes }})

🤝 *Invited*:           {{ referralCount }} users
💰 *Earnings*:        {{ earnings }} {{ cryptoCurrencyCode }}

💳  *Payment Methods* 
       {{ paymentMethods }}
`,

  'manage-payment-methods': '💳  Payment Methods',
  'add-payment-method': '💳  Add payment Method',
  'verify-account': '✅  Verify Account',
  'referral-link': '🤝  Referral Link'
}
