export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All deals are secured with escrow protection`,

    'my-orders-cbbutton': 'Active Orders ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  deals: {
    'next-cbbutton': 'next »',
    'prev-cbbutton': '« prev',
    'show-buy-deals': `📉 *Quick Buy* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to buy from. 

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Buyer Rating* are shown.
`,
    'show-sell-deals': `📈 *Quick Sell* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to sell from. 

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Buyer Rating* are shown.
`,
    'show-buy-deal': `*Buy {{ cryptoCurrencyCode }}*
    
_This deal is by *{{ realName }}*._

*Buyer Account ID*: /u{{ accountId }}
*Last seen*: {{ lastSeenValue }} {{ lastSeenValue }} ago
*⭐️ Rating*: {{ rating }}/5 ({{ tradeCount }})+

*TERMS*: _{{ terms }}_

*Payment Method*: {{ paymentMethodName }}
*Price*: {{ rate }} / {{ cryptoCurrencyCode }}
*Min. Buy Limit*: {{ minFiatTradeValue }}
*Max. Buy Limit*: {{ maxFiatTradeValue }}`,
    'open-buy-deal-cbbutton': '🛎 Buy {{ cryptoCurrencyCode }} here',
    'open-sell-deal-cbbutton': '🛎 Sell {{ cryptoCurrencyCode }} here',
    'back-cbbutton': '⬅️  Back',
    'user-reviews': '🗣 reviews({{ reviewCount }})'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'My Sell order on {{ paymentMethod }}',
    'my-buy-order-cbbutton': 'My Buy on {{ paymentMethod }}',
    'buy-deal-cbbutton': '🛎 Buy Deal @ {{ fiatRate }}',
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
    'my-buy-order-info': `*📗 My Buy Order* - /o{{orderId}}

*Status*: {{ status }}
*Rate {{ cryptoCurrencyCode }}*: {{ rate }}
*Amount*: {{ minAmount }} - {{ maxAmount }} {{ cryptoCurrencyCode }}
*Payment method*: {{ paymentMethod }}

Terms: _{{ terms }}_

*Order share link*: {{ orderLink }}
(_Anyone who clicks on this link can directly open a deal with you._)
`,
    'my-sell-order-info': `*📕 My Sell Order* - /o{{orderId}}

*Status*: {{ status }}
*Rate {{ cryptoCurrencyCode }}*: {{ rate }}
*Amount*: {{ minAmount }} - {{ maxAmount }} {{ cryptoCurrencyCode }}
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
    'input-margin-rate': `*Rate {{ cryptoCurrencyCode }}*

Enter the margin in percentage you want over the bitcoin market price. 

*Current Market rate*: {{ marketRate }} ({{ marketRateSource }})
_Use a negative value for buying or selling under the market price to attract more contacts._

Example: *2%*`,
    'use-margin-price-cbbutton': 'Use margin pricing (%) ➡️',
    'use-fixed-price-cbbutton': '⬅️ Use fixed pricing',
    'back-cbbutton': '⬅️  Back',
    'input-amount-limits': `⚖️ *Order amount*

Enter the amount in *{{ fiatCurrencyCode }}* for this order.

Example: *{{ marketRate }}* or *100-1000* (min-max limit)
`,
    'buy-order-created': '✅ *Buy order created*',
    'sell-order-created': '✅ *Sell order created*',
    'create-error': '❌ Could not create this order. Please try again later.',
    'select-payment-method': `💳 *Payment Method*

Select the payment method`
  },

  'active-orders': {}
}
