import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'

export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All deals are secured with escrow protection

*Market rate*: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'Active Orders ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  deals: {
    trade: {
      errors: {
        409: '❌ You already have an existing trade on this order.',
        404: '❌ Could not find this trade.',
        400: '❌ This trade is invalid or expired.'
      },
      'init-get-confirm': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} wants to buy *{{ cryptoCurrencyAmount }}* for *{{ fiatValue }}*.

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

    'show-sell-insufficient-funds': `❗️ There is not enough balance on sellers account to start this deal. You may request the seller to deposit the funds after which the deal can begin.`,
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
