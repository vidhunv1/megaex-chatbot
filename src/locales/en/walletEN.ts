export const walletEN = {
  'wallet-home': `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
   (Value:       {{ fiatBalance }})
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

Input your amount in  *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}* _(A private OTP link for this amount will be generated to share with the recipient)_
Example: {{ cryptoCurrencyBalance }}

*Available*: {{ cryptoCurrencyBalance }}
     (Value:  {{ fiatValue }})
`,

  'send-cryptocurrency-insufficient-balance': `❌ *Error*
  
Insufficient funds. You need to fund your {{ cryptoCurrencyCode }} wallet to make this payment.

*Available balance*: {{ cryptoCurrencyBalance}}
`,
  'send-cryptocurrency-invalid-amount': `❌ *Error*

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

This OTP link will expire in *{{ expiryTime }}* hours
`,

  'show-deposit-address': `
📩  *Deposit {{ cryptoCurrencyCode }}*

Use the {{ cryptoCurrencyCode }} address below to deposit funds into your wallet.
Funds will be available in your wallet after {{ confirmations }} network confirmation.

❕_Deposit only {{ cryptoCurrencyCode }} funds to this address_
  `,

  'withdraw-cryptocurrency-insufficient-balance': `❌ *Error*
  
Insufficient funds.
  
*Available balance*: {{ cryptoCurrencyBalance}}
`,

  'withdraw-cryptocurrency-amount': `*Enter amount*

Input your amount in  *{{ cryptoCurrencyCode }}* to withdraw.
Example: {{ cryptoCurrencyBalance }}

*Available*: {{ cryptoCurrencyBalance }}
     (Value:  {{ fiatValue }})
`,
  'confirm-withdraw-cryptocurrency-button': '✅ Confirm',

  'confirm-withdraw-cryptocurrency': `*Verify*

Check and confirm your transaction:

*To Address*: {{ toAddress }}
*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
  'withdraw-cryptocurrency-success': `✅ *Withdrawal added*

Your withdraw request was added to the queue. You will receive a notification upon confirmation.
`,
  'withdraw-cryptocurrency-error': `An error occurred. 
  
Please try again later. If you are still facing an issue, contact support @{{ supportUsername}}`,

  'withdraw-cryptocurrency-address': `*Enter address*

Enter the address of the {{ cryptoCurrencyName }} wallet you want to withdraw to.
`,
  'withdraw-cryptocurrency-invalid-address': `❌ *Error*

The address you entered is not a valid *{{ cryptoCurrencyName }}* address.

Please try again with a valid address.
`
}
