import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletEN = {
  /* Home */
  home: {
    wallet: `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
   (Value:       {{ fiatBalance }})
*In Order*:      {{ blockedBalance }}
    
📗  ${BotCommand.TRANSACTIONS}
    
🤝 Invited:    {{ referralCount }} users
💰 Earnings: {{ earnings }}
(_Get your invite link from your account_)`,

    'send-cryptocurrency-cbbutton': '⚡️  Send {{ cryptoCurrencyName }}',
    'my-address': '📩  Deposit',
    withdraw: '📤  Withdraw',
    'transaction-credit': 'credit',
    'transaction-debit': 'debit'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *Deposit {{ cryptoCurrencyCode }}*
    
Use the {{ cryptoCurrencyCode }} address below to deposit funds into your wallet.
Funds will be available in your wallet after {{ confirmations }} network confirmation.
    
❕_Deposit only {{ cryptoCurrencyCode }} funds to this address_
    `
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `*Enter amount*

Input your amount in  *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}* _(A private OTP link for this amount will be generated to share with the recipient)_
Example: {{ cryptoCurrencyBalance }}
    
*Available*: {{ cryptoCurrencyBalance }}
     (Value:  {{ fiatValue }})`,
    confirm: `*Verify*

Check and confirm your transaction:

*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
    'confirm-button': '✅ Confirm',
    'insufficient-balance': `❌ *Error*
  
Insufficient funds. You need to fund your {{ cryptoCurrencyCode }} wallet to make this payment.

*Available balance*: {{ cryptoCurrencyBalance}}
`,
    'invalid-amount': `❌ *Error*

Please enter a valid amount:
Example: _100 INR or 0.0005 BTC_
`,
    'error-creating-payment':
      'There was an error creating this payment, please try again later.',
    'show-created-link': `✅ *Created*

{{ paymentLink }}
(_Share this link privately to send the funds. Anyone with access to this link will get the funds_)

This OTP link will expire in *{{ expiryTime }}* hours`,
    'payment-link-expired':
      'The payment link you created of *{{ cryptoValue }}* has expired.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'This payment link has been claimed.',
      [TransferErrorType.EXPIRED]: 'This payment link has expired.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `The users account has insufficient balance for this payment, you can contact them to fund their account to retry this payment.

*Contact*: @{{ linkCreatorUsername }}
`,
      [TransferErrorType.INVALID_CODE]: 'This payment link is invalid.',
      [TransferErrorType.SELF_CLAIM]: `*Payment Link*

Amount: *{{ cryptoValue }}*
(_Share the link privately to send the funds. Anyone with access to this link will get the funds_)
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'An error occurred. Please try again later.'
    },
    'payment-success': {
      receiver: `🔔 *Credit*

You received *{{ cryptoValueReceived }}* from @{{ senderUsername }}.`,
      sender: `🔔 *Debit*

@{{ receiverUsername }} received *{{ cryptoValueSent }}* from your payment link.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*Enter amount*

Input your amount in  *{{ cryptoCurrencyCode }}* to withdraw.
Example: {{ cryptoCurrencyBalance }}
    
*Available*: {{ cryptoCurrencyBalance }}
     (Value:  {{ fiatValue }})`,
    'input-address': `*Enter address*

Enter the address of the {{ cryptoCurrencyName }} wallet you want to withdraw to.
`,
    'insufficient-balance': `❌ *Error*
  
Insufficient funds.
  
*Available balance*: {{ cryptoCurrencyBalance}}
`,
    'invalid-address': `❌ *Error*

The address you entered is not a valid *{{ cryptoCurrencyName }}* address.

Please try again with a valid address.
`,
    'create-error': `An error occurred. 
  
Please try again later. If you are still facing an issue, contact support @{{ supportUsername}}`,
    confirm: `*Verify*

Check and confirm your transaction:

*To Address*: {{ toAddress }}
*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
    'confirm-button': '✅ Confirm',
    'create-success': `✅ *Withdrawal added*

Your withdraw request was added to the queue. You will receive a notification upon confirmation.`
  },

  transaction: {
    'new-incoming-tx': `🕘 *Incoming {{ cryptoCurrencyCode }}*

You have a new deposit of *{{ cryptoCurrencyValue }}*. This will be available after {{ requiredConfirmation }} network confirmation.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩 *{{ cryptoCurrencyCode }} received*

You received *{{ cryptoCurrencyValue }}*.`,
    'source-name': {
      core: 'deposit',
      payment: 'payment'
    }
  }
}
