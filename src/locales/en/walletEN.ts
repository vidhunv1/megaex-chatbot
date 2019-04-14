export const walletEN = {
  'wallet-home': `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
*Value*:          {{ fiatBalance }}
*Blocked*:      {{ blockedBalance }}

📗  /transactions

🤝 Invited:    {{ referralCount }} users
💰 Earnings: {{ earnings }}
(_Get your invite link from your account_)
`,
  'send-cryptocurrency': '⚡️  Send Bitcoin',
  'my-address': '📩  Deposit',
  withdraw: '📤  Withdraw',

  'send-cryptocurrency-amount': `Enter the amount you want to send in *{{ fiatCurrencyCode }}* or *{{ cryptoCurrencyCode }}* (_A private link to share with your friends will be generated_).

*Available*: {{ cryptoCurrencyBalance }}
*Value*:       {{ fiatValue }}
`,

  'send-cryptocurrency-insufficient-balance': `❌ *Insufficient funds*

  *Available balance*: {{ cryptoCurrencyBalance}}

Please fund your {{ cryptoCurrencyCode }} wallet to make this payment.
`,
  'send-cryptocurrency-invalid-amount': `❌ *Invalid amount*

Please enter a valid amount:
Example: _100 INR or 0.0005 BTC_
`,
  'confirm-send-cryptocurrency': `✅ *Verify*

*Amount*: {{ cryptoCurrencyAmount }}
*Value*: {{ fiatValue }}
`,
  'confirm-send-cryptocurrency-button': '✅ Confirm',
  'show-payment-link': `*Link generated*

{{ paymentLink }}
(Share this link privately to send the funds. Anyone with access to this link will get the funds)

_This link will expire in {{ expiryTime }}_
`
}
