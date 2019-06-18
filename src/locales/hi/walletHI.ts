import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletHI = {
  /* Home */
  home: {
    wallet: `💼  *Bitcoin Wallet*

*Balance*:      {{ cryptoBalance }}
   (Value:       {{ fiatBalance }})
*Blocked*:       {{ blockedBalance }}
    
📗  Tx: ${BotCommand.TRANSACTIONS}
    
🤝 Invited: {{ referralCount }} users
💰 Earnings: {{ earnings }}`,

    'send-cryptocurrency-cbbutton': '⚡️  Send {{ cryptoCurrencyName }}',
    'my-address': '📩  Deposit',
    withdraw: '📤  Withdraw',
    'transaction-credit': 'Credit',
    'transaction-debit': 'Debit'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *Deposit {{ cryptoCurrencyCode }}*
    
Use the {{ cryptoCurrencyC{{ cryptoCurrencyCode }} address se aap doosre BTC address pe BTC bhej aur withdraw kar sakte hain. BTC amount ko aapke account mein add kar diya jayega jab {{ confirmations }} side se pushti ho jaata hai.ode }} address below to deposit funds into your wallet.
Funds will be available in your wallet after {{ confirmations }} network confirmation.
    
❕ Zaroori Soochna: Apne address pe sirf {{ cryptoCurrencyCode }} funds hi deposit karein`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *Send {{ cryptoCurrencyName }}*:
    
Kitna Amount send karna chahenge? (only *in BTC or INR*) 

One time link ko copy karke sirf unke saath share kijiye jisko aap {{ cryptoCurrencyName }} bhejna chahte hain.
    
*Available*: {{ cryptoCurrencyBalance }}
*Value*: {{ fiatValue }})`,
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

Please enter a valid amount.`,
    'error-creating-payment':
      'Sorry. Payment process hone mein koi error hai. Please thodi der baad try karein.',
    'show-created-link': `✅ *Generated Link*

{{ paymentLink }}
One time link ko copy karke sirf unke saath share kijiye jisko aap {{ cryptoCurrencyName }} bhejna chahte hain. 

Yeh link *{{ expiryTime }} hours* mein expire ho jayega.`,
    'payment-link-expired':
      'Yeh payment link *{{ cryptoValue }}* expire ho gya hai. Seller ko contact karein aur new payment link pe fir se try karein.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'Yeh payment link ko claim kar liya gya hai.',
      [TransferErrorType.EXPIRED]:
        'Yeh payment link ko claim kar liya gya hai.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `User ke account mein balance low hai, user ko contact karein aur funds add karne ko notify karein uske baad naya payment link le.

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'Yeh payment link invalid hai.',
      [TransferErrorType.SELF_CLAIM]: `*Payment Link*

Amount: *{{ cryptoValue }}*
One time link ko copy karke sirf unke saath share kijiye jisko aap {{ cryptoCurrencyName }} bhejna chahte hain. Iss link ko job bhi user click karega uske account pe payment credit ho jayega.
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'Sorry. Error hai, thodi der baad fir try karein.'
    },
    'payment-success': {
      receiver: `🔔 *Credit*

Aapke account pe @{{ senderUsername }} ne *{{ cryptoValueReceived }}* credit kar diya hai.`,
      sender: `🔔 *Debit*

@{{ receiverUsername }} ne aapke payment link se *{{ cryptoValueSent }}* receive kiya hai.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*Amount enter karein*

Withdraw amount *{{ cryptoCurrencyCode }}* enter karein.
Example: {{ cryptoCurrencyBalance }}
        
*Available*: {{ cryptoCurrencyBalance }}
*Value*:  {{ fiatValue }}`,
    'input-address': `*Enter address*

Enter the address of the {{ cryptoCurrencyName }} wallet you want to withdraw to.
`,
    'insufficient-balance': `❌ *Error*
  
Aapke account mein funds low hai.

*Available balance*: {{ cryptoCurrencyBalance}}
`,
    'invalid-address': `❌ *Error*

Yeh {{ cryptoCurrencyName }} address invalid hai.

Valid address enter karein.
`,
    'less-than-min-error': `❌ *Error*

    Minimum withdrawal amount *{{ minWithdrawAmount }}* hai.`,
    'create-error': `An error occurred. 
  
Thodi der baad try karein. Agar aapko fir se error dikh rha hai toh support team @{{ supportUsername}} ko contact karein.`,
    confirm: `*Verify*

Kya yeh amount sahi hai? agar sahi hai to niche diye hue button *"Yes, I confirm"* pe click karein

*To Address*: {{ toAddress }}
*Amount: {{ cryptoCurrencyAmount }}*
(Value:   {{ fiatValue }})
`,
    'confirm-button': '✅ Confirm',
    'create-success': `✅ *Withdrawal added*

Aapka BTC withdraw request abhi process ho rha hai. Please thodi der wait karein. Withdraw process poora hone par aapko notification mil jayega.

❕Network fee of *{{ feeValue }}* will be used for this withdrawal.
`,
    'withdraw-processed': `🔔 *Withdrawal Processed*

Aapke account se *{{ cryptoCurrencyAmount }}* withdraw process complete ho gya hai.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘 *Incoming {{ cryptoCurrencyCode }}*

Aapke account mein *{ cryptoCurrencyValue }}* jama ho gya hai. {{ requiredConfirmation }} side se pushti ho jaane par BTC amount ko aapke account mein add kar diya jayega.
txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩 *{{ cryptoCurrencyCode }} received*

Aapke acccount mein *{{ cryptoCurrencyValue }}* add kar diya gya hai.`,
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
