export const walletEN = {
  'wallet-home': `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
(Value:          {{ fiatBalance }})
*In Order*:      {{ blockedBalance }}

📗  /transactions

🤝 Invited:    {{ referralCount }} users
💰 Earnings: {{ earnings }}
(_Get your invite link from your account_)
`,
  'send-cryptocurrency': '⚡️  Send {{ cryptoCurrencyName }}',
  'my-address': '📩  Deposit',
  withdraw: '📤  Withdraw',

  'send-cryptocurrency-amount': `*Enter amount*

*Available*: {{ cryptoCurrencyBalance }}
(Value:       {{ fiatValue }})

Input your amount in  *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}*.
_Example: {{ cryptoCurrencyBalance }}_
`,

  'send-cryptocurrency-insufficient-balance': `❌ *Insufficient funds*

*Available balance*: {{ cryptoCurrencyBalance}}

Please fund your {{ cryptoCurrencyCode }} wallet to make this payment.
`,
  'send-cryptocurrency-invalid-amount': `❌ *Invalid amount*

Please enter a valid amount:
Example: _100 INR or 0.0005 BTC_
`,
  'confirm-send-cryptocurrency': `*Verify*

Confirm your transaction:

*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
  'confirm-send-cryptocurrency-button': '✅ Confirm',
  'show-payment-link': `*Link generated*

{{ paymentLink }}
(_Share this link privately to send the funds. Anyone with access to this link will get the funds_)

This link will expire in *{{ expiryTime }}*
`
}
