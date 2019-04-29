export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All deals are secured with escrow protection`,

    'my-orders-cbbutton': '📖 My Orders ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  buy: {
    'show-orders': 'TODO: Show buy orders'
  },

  sell: {
    'show-orders': 'TODO: Show sell orders'
  },

  'my-orders': {
    'show-orders': 'TODO: Show my orders'
  },

  'create-order': {
    show: `📊 *Create Order*

Select the order type.`,
    'new-buy-order-cbbutton': '📗  New buy order',
    'new-sell-order-cbbutton': '📕  New sell order',
    'input-fixed-rate': `*Rate {{ cryptoCurrencyCode }}*

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
    'create-error': '❌ Could not create this order. Please try again later.',
    'select-payment-method': `💳 *Payment Method*

Select the payment method`
  }
}
