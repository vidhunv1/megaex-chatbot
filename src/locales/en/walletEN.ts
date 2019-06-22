import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletEN = {
  /* Home */
  home: {
    wallet: `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
   (Value:       {{ fiatBalance }})
*Blocked*:       {{ blockedBalance }}
    
📗  Tx: ${BotCommand.TRANSACTIONS}
    
🤝 Invited: {{ referralCount }} users
💰 Earnings: {{ earnings }}`,

    'send-cryptocurrency-cbbutton': '⚡️  Send {{ cryptoCurrencyName }} cheque',
    'my-address': '📩  Deposit',
    withdraw: '📤  Withdraw',
    'transaction-credit': 'Credit',
    'transaction-debit': 'Debit'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *Deposit {{ cryptoCurrencyCode }}*
    
Use the {{ cryptoCurrencyCode }} address below to deposit funds into your wallet.
Funds will be available in your wallet after {{ confirmations }} network confirmation.
    
❕NOTE: Deposit only {{ cryptoCurrencyCode }} funds to this address`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *Input amount*

Input your amount in  *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}*

A cheque for this amount will be generated to share with the person you want to send the {{ cryptoCurrencyCode }} to.

Example: {{ cryptoCurrencyBalance }}
    
*Available*: {{ cryptoCurrencyBalance }}
*Value*: {{ fiatValue }}`,
    confirm: `👁‍🗨*Confirm*

Is this correct? If yes, click on *"Confirm"*.:

*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
    'confirm-button': '✅ Confirm',
    'insufficient-balance': `❌ *Error*
  
Insufficient funds. You need to add {{ cryptoCurrencyCode }} to your wallet to send this payment

*Available balance*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❌ *Error*

Please enter a valid amount:`,
    'error-creating-payment':
      'There was an error creating this payment, please try again later.',
    'show-created-link': `✅ *Generated Link*

{{ paymentLink }}
Share this link privately to send the funds to open in Telegram. Anyone with access to this link will get the funds.

This one-time link will expire in *{{ expiryTime }} hours*`,
    'payment-link-expired':
      'The payment link you created of *{{ cryptoValue }}* has expired.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'This payment link has been claimed.',
      [TransferErrorType.EXPIRED]: 'This payment link has expired.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `The users account has insufficient balance for this payment, you can contact them to fund their account to retry this payment.

*Contact*: @{{ linkCreatorUsername }}`,
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
    'less-than-min-error': `❌ *Error*

The minimum withdrawal amount is *{{ minWithdrawAmount }}*
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

Your withdraw request was added to the queue. You will receive a notification when processed.

❕Network fee of *{{ feeValue }}* will be used for this withdrawal.
`,
    'withdraw-processed': `🔔 *Withdrawal Processed*

Your withdrawal of *{{ cryptoCurrencyAmount }}* has been processed.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘 *Incoming {{ cryptoCurrencyCode }}*

You have a new deposit of *{{ cryptoCurrencyValue }}*. This will be available after {{ requiredConfirmation }} network confirmation.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩 *{{ cryptoCurrencyCode }} received*

You received *{{ cryptoCurrencyValue }}*.`,
    'source-name': {
      core: 'deposit',
      payment: 'payment',
      withdrawal: 'withdraw',
      release: 'release',
      block: 'block',
      trade: 'trade',
      comission: 'comission',
      fees: 'fees'
    }
  }
}
