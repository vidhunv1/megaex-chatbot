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

Input your amount in  *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}*.
_Example: {{ cryptoCurrencyBalance }}_

*Available*: {{ cryptoCurrencyBalance }}
(Value:       {{ fiatValue }})
`,

  'send-cryptocurrency-insufficient-balance': `❌ *Insufficient funds*
  
You need to fund your {{ cryptoCurrencyCode }} wallet to make this payment.

*Available balance*: {{ cryptoCurrencyBalance}}
`,
  'send-cryptocurrency-invalid-amount': `❌ *Invalid amount*

Please enter a valid amount:
Example: _100 INR or 0.0005 BTC_
`,
  'confirm-send-cryptocurrency': `*Verify*

Check and confirm your transaction:

*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
  'confirm-send-cryptocurrency-button': '✅ Confirm',
  'show-payment-link': `✅ *Link generated*

{{ paymentLink }}
(_Share this link privately to send the funds. Anyone with access to this link will get the funds_)

This OTP link will expire in *{{ expiryTime }}*
`
}
