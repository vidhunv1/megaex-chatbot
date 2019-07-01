import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletEN = {
  /* Home */
  home: {
    wallet: `💼  *Bitcoin Wallet*

 Balance:    {{ cryptoBalance }}
     Value:    {{ fiatBalance }}
 Blocked:    {{ blockedBalance }}

   Invited:    {{ referralCount }} users
Earnings:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ Send',
    'my-address': '📩  Deposit',
    withdraw: '📤  Withdraw',
    'transaction-credit': 'Credit',
    'transaction-debit': 'Debit'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *Deposit {{ cryptoCurrencyCode }}*

Funds will be available in your wallet after {{ confirmations }} network confirmation. Use the {{ cryptoCurrencyCode }} address below to deposit funds into your wallet.

NOTE: *Deposit only {{ cryptoCurrencyCode }} funds* to this address.`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *Amount to send*

Enter the amount in *{{ cryptoCurrencyCode }}* or *{{ fiatCurrencyCode }}*.

Example: {{ cryptoCurrencyBalance }}

Available: {{ cryptoCurrencyBalance }}
    Value: {{ fiatValue }}`,
    confirm: `👁‍🗨*Confirm*

Is this correct? If yes, click on *"Confirm"*.:

Amount: {{ cryptoCurrencyAmount }}
 Value:  {{ fiatValue }})
`,
    'confirm-button': '✔️  Confirm',
    'insufficient-balance': `❗️  *Insufficient funds*

Add {{ cryptoCurrencyCode }} to your wallet to send this payment.

*Available balance*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❗️  *Amount Invalid*

Enter a valid amount.`,
    'error-creating-payment':
      'There was an error creating this payment, please try again later.',
    'show-created-link': `✅  *Cheque created*

{{ paymentLink }}
Share this link privately. Anyone with access to this link will get the funds.

This link will expire in *{{ expiryTime }} hours*.`,
    'payment-link-expired':
      'The payment link you created of *{{ cryptoValue }}* has expired.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'This payment link has been claimed.',
      [TransferErrorType.EXPIRED]: 'This payment link has expired.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `The users account has insufficient balance for this payment, you can contact them to fund their account to retry this payment.

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'This payment link is invalid.',
      [TransferErrorType.SELF_CLAIM]: `✅  *Payment Link*

Amount: *{{ cryptoValue }}*
Share the link privately to send the funds. Anyone with access to this link will get the funds.
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'An error occurred. Please try again later.'
    },
    'payment-success': {
      receiver: `✅ *New Credit*

You received *{{ cryptoValueReceived }}* from [{{ senderName }}](tg://user?id={{ senderTelgramId }}).`,
      sender: `✅ *New Debit*

[{{ receiverName }}](tg://user?id={{ receiverTelegramId }}) received *{{ cryptoValueSent }}* from your payment link.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*Withdraw BTC*

Enter amount in  *{{ cryptoCurrencyCode }}* to withdraw.
Example: 0.018291 BTC

Available: {{ cryptoCurrencyBalance }}
Value: {{ fiatValue }}`,
    'input-address': `*BTC address*

Enter the address of the {{ cryptoCurrencyName }} wallet you want to withdraw to.
`,
    'insufficient-balance': `❗️ *Insufficient Funds*

Funds in wallet are too low. Add funds & try again.

*Available balance*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *Invalid Address*

Check the *{{ cryptoCurrencyName }}* address & try again.
`,
    'less-than-min-error': `❗️ The minimum withdrawal amount is *{{ minWithdrawAmount }}*.
`,
    'create-error': `An error occurred.

Please try again later. If you are still facing an issue, contact support @{{ supportUsername}}`,
    confirm: `👁‍🗨  *Verify details*

To Address: {{ toAddress }}
    Amount: {{ cryptoCurrencyAmount }}
     Value: {{ fiatValue }})
`,
    'confirm-button': '✔️ Confirm',
    'create-success': `⏳ *Withdrawal Processing...*

Your withdrawal request is in queue. You will receive a notification when it's processed.

Network fee of *{{ feeValue }}* will be used.`,
    'withdraw-processed': `✅ *Withdrawal Completed*

Your withdrawal of *{{ cryptoCurrencyAmount }}* is completed.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *Incoming {{ cryptoCurrencyCode }}*

You have a new deposit of *{{ cryptoCurrencyValue }}*. Will be added after {{ requiredConfirmation }} confirmation on the network.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  *{{ cryptoCurrencyCode }} received*

*{{ cryptoCurrencyValue }}* added to wallet.`,
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
