import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'

export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All trades are secured with escrow protection

*Market rate*: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'Active Orders ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  deals: {
    trade: {
      'open-dispute-cbbutton': '👩‍🎓 Trade support',
      'dispute-initiator': `*Trade support* ${BotCommand.TRADE}{{ tradeId }}

An issue has been raised on this trade, any transaction on this trade is temporarily blocked. Please contact @{{ legalUsername }} to resolve this.`,
      'dispute-received': `*Trade support* ${BotCommand.TRADE}{{ tradeId }}

The user has raised an issue on this trade. 

Please contact @{{ legalUsername }} to resolve this.`,
      'confirm-payment-received': `*Confirm*

Are you sure you have received *{{ fiatAmount }}* from the buyer?`,
      'confirm-payment-received-yes-cbbutton': 'Yes',
      'confirm-payment-received-no-cbbutton': 'No',
      'payment-released-buyer': `🚀 *{{ cryptoCurrency }} credited* ${
        BotCommand.TRADE
      }{{ tradeId }}

Your wallet is credited with *{{ cryptoAmount }}* from this trade.

🎉 _Invite your friends and family here so they can also have the best experience to buy/sell bitcoins (Use your referral link so you can earn from their trades)._
{{ referralLink }}`,
      'payment-released-seller': `🚀 *Trade success* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}* was sent to the buyer.

🎉 _Invite your friends and family here so they can also have the best experience to buy/sell bitcoins (Use your referral link so you can earn from their trades)._
{{ referralLink }}`,
      'confirm-payment-sent': `*Confirm*

Are you sure you have sent *{{ fiatAmount }}* to the sellers *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'Yes',
      'confirm-payment-sent-no-cbbutton': 'No',
      'payment-sent-buyer': `*🛎 Trade* ${BotCommand.TRADE}{{ tradeId }}

Seller has been notified. Please wait for the the seller to confirm your payment.

❕If there is no confirmation you can contact *Trade support*.`,
      'payment-sent-seller': `*🛎 Payment confirmed* ${
        BotCommand.TRADE
      }{{ tradeId }}

The buyer has sent *{{ fiatAmount }}* to your *{{ paymentMethod }}*. Please confirm when you receive this transaction.

❕If you have not received this transaction in some time you can contact *Trade support*.`,
      'escrow-warn-seller': `*Info*

The seller is yet to make payment for the trade ${
        BotCommand.TRADE
      }{{ tradeId }}.
      
You can contact our *support* if you think something is wrong, they will take care of this issue for you.

❕_If no confirmation is received in_ *{{ paymentSendTimeout }} mins*, _the blocked amount will be automatically released to you._`,
      'escrow-warn-buyer': `*Reminder*

You are yet to make the payment for the trade ${
        BotCommand.TRADE
      }{{ tradeId }}. Click the button below if you have already made the payment.

⚠️ You have *{{ paymentSendTimeout }} mins* left to make this payment. Please note that any payment made after this time will be invalid.`,
      'escrow-closed-seller': `*Trade closed*

The buyer did not confirm any payment made to you for trade ${
        BotCommand.TRADE
      }{{ tradeId }}.

Your *{{ cryptoAmount }}* has been returned back to you. For issues related to this trade please contact our *support*.`,
      'escrow-closed-buyer': `*Trade closed*

You did not make any payment to the seller for the trade ${
        BotCommand.TRADE
      }{{ tradeId }}. For issues related to this trade please contact our *support*.`,
      'cancel-trade-confirm': `Are you sure you want to cancel the trade ${
        BotCommand.TRADE
      }{{ tradeId }} on *{{ fiatAmount }}*?

⚠️ Never cancel if you have already paid the seller.`,
      'cancel-trade-confirm-yes-cbbutton': 'yes',
      'cancel-trade-confirm-no-cbbutton': 'no',
      'cancel-trade-success': 'You canceled this trade.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'The trade was already canceled or expired.',
      'cancel-trade-notify': `❗️The trade ${
        BotCommand.TRADE
      }{{ tradeId }} was canceled by the user.`,
      'trade-rejected-notify':
        '❗️The user canceled this trade. You can try other deals.',
      'trade-rejected-success': 'You rejected this trade.',
      'trade-accepted-seller-success': `🛎 *Trade Open* ${
        BotCommand.TRADE
      }{{ tradeId }}

The user has been notified to deposit *{{ fiatPayAmount }}* in your *{{ paymentMethodName }}*.

Telegram: {{ buyerUsername }}

You will be notified when this payment has been marked as completed.`,
      'trade-accepted-buyer-no-payment-info':
        'Send a message to seller for the payment details.',
      'trade-accepted-buyer': `🛎 *Trade Accepted* ${
        BotCommand.TRADE
      }{{ tradeId }}

Make a payment of {{ fiatPayAmount }} through {{ paymentMethodName }}, you will receive *{{ cryptoAmount }}* when your payment is confirmed.

*{{ paymentMethodName }}*
Amount: *{{ fiatPayAmount }}*
{{ paymentDetails }}
Payment reference: *T{{ tradeId }}*

Telegram: {{ telegramUsername }}

🔒 _This trade is secured. Payment valid only for_ *{{ paymentSendTimeout }} mins*.`,
      'payment-received-cbbutton': '💵  Payment Received',
      'payment-sent-cbbutton': '💸  I have paid',
      'trade-accepted-fail': 'There was an error in opening this trade.',

      errors: {
        409: '❌ You already have an existing trade on this order.',
        404: '❌ Could not find this trade.',
        400: '❌ This trade is invalid or expired.'
      },
      'init-get-confirm-buy': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} wants to buy *{{ cryptoCurrencyAmount }}* for *{{ fiatValue }}* at rate {{ fixedRate }}.

Do you want to accept this trade?`,
      'init-get-confirm-sell': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} wants to sell *{{ cryptoCurrencyAmount }}* for *{{ fiatValue }}* at rate {{ fixedRate }}.

Do you want to accept this trade?`,
      'trade-init-yes-cbbutton': 'Yes',
      'trade-init-no-cbbutton': 'No',
      'trade-init-no-response': `💤 *No Response*

This user is currently away. Please try other trades.`,
      'trade-init-expired': `⏳ *Trade expired*

The trade request ${
        BotCommand.TRADE
      }{{ tradeId }} has expired and canceled since you did not respond.

❕You can pause your order easily if you are away. This ensures a good experience for everyone.`
    },
    'request-deposit-notify': `🛎 *New Match*

You have a new buy request on your order ${BotCommand.ORDER}{{ orderId }}.

*{{ requesterName }}* (@{{ requesterUsername }}) wants to buy *{{ formattedCryptoValue }}* for *{{ formattedFiatValue }}*.

⚠️ You need to deposit the required funds before you can start this trade.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Order not found.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'You cannot open deal on your own order!',
      default: 'An error occured. Please try again later.'
    },
    'next-cbbutton': 'next',
    'prev-cbbutton': 'prev',
    'show-buy-deals': `📉 *Quick Buy* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to buy from. 

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Seller Rating* are shown.
`,
    'show-sell-deals': `📈 *Quick Sell* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to sell from. 

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Buyer Rating* are shown.
`,
    'show-buy-deal': `📉 *Buy {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})
    
_This deal is by_ *{{ realName }}*.

Account ID: ${BotCommand.ACCOUNT}{{ accountId }}
Last seen: {{ lastSeenValue }}
Rating:  {{ rating }} ⭐️

*Payment Method*: {{ paymentMethodName }}
*Terms*: _{{ terms }}_

*Price*: {{ rate }} / {{ cryptoCurrencyCode }}
*Buy Amount*: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *Sell {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})
    
_This deal is by_ *{{ realName }}*.

Account ID: ${BotCommand.ACCOUNT}{{ accountId }}
Last seen: {{ lastSeenValue }}
Rating:  {{ rating }} ⭐️

*Payment Method*: {{ paymentMethodName }}
*Terms*: _{{ terms }}_

*Price*: {{ rate }} / {{ cryptoCurrencyCode }}
*Sell Amount*: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `❗️ There is not enough balance on sellers account to start this deal. You can request the seller to deposit the funds after which you can start the trade again.`,
    'request-buy-deal-deposit-cbbutton': '📲 Contact seller',

    'open-buy-deal-cbbutton': '🛎  Buy {{ cryptoCurrencyCode }} here',
    'open-sell-deal-cbbutton': '🛎  Sell {{ cryptoCurrencyCode }} here',
    'back-cbbutton': '⬅️  Back',
    'user-reviews': '🗣 reviews ({{ reviewCount }})',
    'input-buy-amount': `💵 *Input buy amount*

Input the amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}* or from *{{ minCryptoValue }}* to *{{ maxCryptoValue }}* to buy. 

If you want to specify {{ cryptoCurrencyCode }} value, then add the ticker(*{{ cryptoCurrencyCode }}*) (Example: 0.1 {{ cryptoCurrencyCode }})`,
    'input-sell-amount': `💵 *Input sell amount*

Input the amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}* or from *{{ minCryptoValue }}* to *{{ maxCryptoValue }}* to sell. 

If you want to specify {{ cryptoCurrencyCode }} value, then add the ticker(*{{ cryptoCurrencyCode }}*) (Example: 0.1 {{ cryptoCurrencyCode }})`,
    'confirm-input-buy-amount': `*Confirm*
    
Are you sure you want to buy *{{ cryptoValue }}* for *{{ fiatValue }}* at rate {{ rate }}?

❕By continuing you agree to the deal terms.`,

    'confirm-input-sell-amount': `*Confirm*
    
Are you sure you want to sell *{{ cryptoValue }}* for *{{ fiatValue }}* at rate *{{ rate }}*?

❕By continuing you agree to the deal terms.`,
    'confirm-input-amount-yes-cbbutton': 'Yes',
    'confirm-input-amount-no-cbbutton': 'No',
    'show-open-deal-request': `📲 *Request sent*

Your request has been sent, this deal will only start after the seller has deposited the required funds.

⚠️ Never make any payment before the deposit has been confirmed here. Do not make any deals outside this bot, you risk losing your money.

*Seller's telegram*: @{{ telegramUsername}}`,
    'show-open-deal-cancel': 'Deal canceled.',
    'trade-opened-message': 'trade opened!',
    'show-opened-trade': `*Trade* ${BotCommand.TRADE}{{ tradeId }}

Waiting for ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. If user doesn't appear within {{ timeoutMinutes }} minutes, the deal will automatically cancel.

⚠️ For your security do not make any trades outside this bot.

You can cancel the deal any time. Keep in mind that the money you have sent will not return if you cancel the transaction.

*Auto cancel in {{ timeoutMinutes }} minutes*`,
    'cancel-trade-cbbutton': '🚫 Cancel trade'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'My Sell order on {{ paymentMethod }}',
    'my-buy-order-cbbutton': 'My Buy on {{ paymentMethod }}',
    'buy-deal-cbbutton': '🛎 Buy trade @ {{ fiatRate }}',
    'sell-deal-cbbutton': '🛎 Sell Deal @ {{ fiatRate }}',
    'deposit-cryptocurrency': '📩 Deposit {{ cryptoCurrencyCode }}',
    'show-active-orders': `*Active Orders*

Your ongoing deals and orders created by you are listed.
`,
    'order-enabled': 'Active',
    'input-payment-details-field': `Write your *{{ fieldName }}* for *{{ paymentMethod}}*`,
    'order-disabled': `Inactive
_(Click on Active button to enable this order.)_`,
    'show-orders': 'TODO: Show my orders',

    'terms-not-added': 'None',
    'my-buy-order-info': `*📗 My Buy Order* - ${BotCommand.ORDER}{{orderId}}

*Status*: {{ status }}
*Rate {{ cryptoCurrencyCode }}*: {{ rate }}
*Min. amount*: {{ minAmount }}
*Max. amount*: {{ maxAmount }}
*Payment method*: {{ paymentMethod }}

Terms: _{{ terms }}_

*Order share link*: {{ orderLink }}
(_Anyone who clicks on this link can directly open a deal with you._)
`,
    'payment-info-not-added': 'Not added',
    'insufficient-sell-order-balance':
      '⚠️ Infufficient balance. You need to deposit the equivalent minimum amount to start deals on this order.',
    'my-sell-order-info': `*📕 My Sell Order* - ${BotCommand.ORDER}{{orderId}}

*Status*: {{ status }}
*Rate {{ cryptoCurrencyCode }}*: {{ rate }}
*Min. amount*: {{ minAmount }}
*Max. amount*: {{ maxAmount }}
*Payment method*: {{ paymentMethod }}
*Payment Info*: {{ paymentInfo }}

Terms: _{{ terms }}_

*Order share link*: {{ orderLink }}
(_Anyone who clicks on this link can directly open a deal with you._)
`,
    'edit-amount-cbbutton': '⚖️ Amount',
    'edit-rate-cbbutton': '💸 Rate BTC',
    'edit-terms-cbbutton': '📝 Terms',
    'edit-payment-method-cbbutton': '💳 Payment method',
    'toggle-active-cbbutton': 'Active',
    'delete-order-cbbutton': '🗑️ Delete!',
    'edit-order': '✏️  Edit order',
    'go-back-cbbutton': '⬅️  Back',
    'order-edit-success': '✅ Your order was updated.',
    'edit-payment-details': '📃 Update payment info',
    'order-edit-rate': `*Rate {{ cryptoCurrencyCode }}*

Set the rate for {{ cryptoCurrencyCode }} for this order. Write your margin in percentage(%) or set up a fixed price.

Example: *2%* or *{{ marketRate }}*`,
    'order-edit-terms': `📝 *Terms*

Write your terms for the trade. This will be shown on your order.`,
    'order-delete-success': 'Order deleted'
  },

  'create-order': {
    show: `📊 *Create Order*

Select the order type.`,
    'new-buy-order-cbbutton': '📗  New buy order',
    'new-sell-order-cbbutton': '📕  New sell order',
    'input-fixed-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Enter the fixed rate of {{ cryptoCurrencyCode }} for this order (in {{ fiatCurrencyCode }}).

Example: *{{ marketRate }}*`,
    'input-margin-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Enter the margin in percentage you want over the bitcoin market price. 

*Current Market rate*: {{ marketRate }} ({{ marketRateSource }})
_Use a negative value for buying or selling under the market price to attract more contacts._

Example: *2%*`,
    'use-margin-price-cbbutton': 'Use margin pricing (%) ➡️',
    'use-fixed-price-cbbutton': '⬅️ Use fixed pricing',
    'back-cbbutton': '⬅️  Back',
    'input-amount-limits': `⚖️ *Order amount*

Enter the order amount in *{{ fiatCurrencyCode }}*.

Example: *1000* or *500-1000* (min-max limit)
`,
    'buy-order-created': '✅ *Buy order created*',
    'sell-order-created': '✅ *Sell order created*',
    'create-error': '❌ Could not create this order. Please try again later.',
    'select-payment-method': `💳 *Payment Method*

Select the payment method`
  },

  'active-orders': {}
}
