import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All trades are secured with escrow guarantee.

Market rate: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'My Active ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  deals: {
    'no-quick-sell': `📉  *Quick Buy*

No active buy orders. Create a new buy order.`,
    'new-quick-sell-cbbutton': '📗 New buy order',
    'no-quick-buy': `📉  *Quick Sell*

No active sell orders. Create a new sell order.`,
    'new-quick-buy-cbbutton': '📕 New sell order',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *Dispute resolved*

After careful review based on proof submitted by both parties, we confirm that you are genuine on your part with the trade.

Appropriate action has been taken against the buyer. We are sorry for any inconvenience caused.

The locked funds has been *released*. Check your wallet.`,
      'dispute-resolved-buyer-win': `👩‍🎓  *Dispute resolved*

After careful review based on proof submitted by both parties, we confirm that you are genuine on your part with the trade.

Appropriate action has been taken against the seller. We are sorry for any inconvenience caused.

{{ cryptoAmount }} has been *credited*. Check your wallet.`,
      'dispute-resolved-seller-lose': `👩‍🎓  *Dispute resolved*

After careful review based on proof submitted by both parties, we confirm that there is fault on your part in thsi trade.

NOTE: Repeated offence will result in a permanent ban.`,
      'dispute-resolved-buyer-lose': `‍🎓  *Dispute resolved*

After careful review based on proof submitted by both parties, we confirm that there is fault on your part in this22 trade.

NOTE: Repeated offence will result in a permanent ban.`,
      'referral-comission': `🚀  *Commission Received*

Congratulations! You received {{ cryptoAmount }} commission from your referrals trade. Keep inviting.`,
      'open-dispute-cbbutton': '👩‍🎓 Open Issue',
      'dispute-initiator': `*Trade support* ${BotCommand.TRADE}{{ tradeId }}

An issue has been raised on this trade. Trade is temporarily blocked. Please contact @{{ legalUsername }} to resolve this.`,
      'dispute-received': `*Trade support* ${BotCommand.TRADE}{{ tradeId }}

The user has raised an issue on this trade.

Please contact @{{ legalUsername }} to resolve this.`,
      'confirm-payment-received': `*Payment Confirmation*

Are you sure you have received *{{ fiatAmount }}* from the buyer?`,
      'confirm-payment-received-yes-cbbutton': 'Yes',
      'confirm-payment-received-no-cbbutton': 'No',
      'payment-released-buyer': `🚀 *{{ cryptoCurrency }} credited* ${
        BotCommand.TRADE
      }{{ tradeId }}

Your wallet is credited with *{{ cryptoAmount }}* from this trade.`,
      'payment-released-seller': `🚀 *Successful Trade* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}* debited from your wallet and released to the buyer.`,
      'give-rating': `🏅  *Rate this trade*

Give your rating for this trade.`,
      'give-review': `🗣  *Trade review*

Write a short review for this trade`,
      'end-review': `Review added.

🎉 Invite your friends so they can also have the best experience, you can use your referral to earn fees from their trades.

{{ referralLink }}`,
      'skip-review': 'Skip ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*Confirm Payment*

Have you sent *{{ fiatAmount }}* to the sellers *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'Yes',
      'confirm-payment-sent-no-cbbutton': 'No',
      'payment-sent-buyer': `*🛎 Trade* ${BotCommand.TRADE}{{ tradeId }}

Seller has been notified. Please wait for the the seller to confirm your payment.

In case, there is no confirmation; you can 'Raise issue'.`,
      'payment-sent-seller': `🛎  *Payment confirmed* ${
        BotCommand.TRADE
      }{{ tradeId }}

The buyer has sent *{{ fiatAmount }}* to your *{{ paymentMethod }}*. Please confirm when you receive the payment.

In case you don't receive the payment, you can *Raise Issue*.`,
      'escrow-warn-seller': `*Info*

The buyer is yet to make payment for the trade. ${
        BotCommand.TRADE
      }{{ tradeId }}.

You can contact our *support* if you think something is wrong, they will assist you.

If no confirmation is received in *{{ paymentSendTimeout }} mins*, the blocked amount will be automatically released to you.`,
      'escrow-warn-buyer': `*Trade Payment Reminder*

You are yet to make the payment for the trade ${
        BotCommand.TRADE
      }{{ tradeId }}. Click 'I have paid' if you have already made the payment.

⚠️ You have *{{ paymentSendTimeout }} mins* left to make this payment. Any payment made after that will be invalid.`,
      'escrow-closed-seller': `🤷‍♂️  *Trade closed*

The buyer did not pay and confirm payment for the trade. ${
        BotCommand.TRADE
      }{{ tradeId }}.

Your *{{ cryptoAmount }}* has been returned back to you. For issues related to this trade please contact our *support*.`,
      'escrow-closed-buyer': `🤷‍♂️  *Trade Closed*

You did not make any payment to the seller for the trade. ${
        BotCommand.TRADE
      }{{ tradeId }}. For issues related to this trade, please contact our *support*.`,
      'cancel-trade-confirm': `Are you sure you want to cancel the trade ${
        BotCommand.TRADE
      }{{ tradeId }} on *{{ fiatAmount }}*?

⚠️ Never cancel if you have already paid the seller.`,
      'cancel-trade-confirm-yes-cbbutton': 'yes',
      'cancel-trade-confirm-no-cbbutton': 'no',
      'cancel-trade-success': 'This trade was cancelled by you.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'The trade is cancelled already or has expired.',
      'cancel-trade-notify': `❗️The trade ${
        BotCommand.TRADE
      }{{ tradeId }} was cancelled by the user.`,
      'trade-rejected-notify':
        'The user cancelled this trade. You can choose other good deals under Quick Buy / Sell.',
      'trade-rejected-success': 'You rejected this trade.',
      'trade-accepted-seller-success': `🛎 *Trade Open* ${
        BotCommand.TRADE
      }{{ tradeId }}

The user has been notified to deposit *{{ fiatPayAmount }}* in your *{{ paymentMethodName }}*.

[Telegram contact](tg://user?id={{ buyerUserId }})

You will be notified when this payment has been marked as completed.`,
      'trade-accepted-buyer-no-payment-info':
        'Send a message to seller for the payment details.',
      'trade-accepted-buyer': `🛎  *Trade Accepted* ${
        BotCommand.TRADE
      }{{ tradeId }}

Make a payment of {{ fiatPayAmount }} through {{ paymentMethodName }}, you will receive *{{ cryptoAmount }}* when your payment is confirmed.

*{{ paymentMethodName }}*
Amount: *{{ fiatPayAmount }}*
Payment reference: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram contact](tg://user?id={{ buyerUserId }})

🔒 This trade is secured. Payment valid only for *{{ paymentSendTimeout }} mins*.`,
      'payment-received-cbbutton': '💵  Payment received',
      'payment-sent-cbbutton': '💸  I have paid',
      'trade-accepted-fail':
        '️Sorry. There was an error in opening this trade.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ You already have an existing trade on this order. You cannot place multiple trades for the same order.',
        [TradeError.NOT_FOUND]: '❗️ We could not find this trade.',
        [TradeError.TRADE_EXPIRED]: '❗️ This trade is invalid or expired.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❗️ You have insufficient balance to open this trade'
      },
      'init-get-confirm-buy': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} wants to buy *{{ cryptoCurrencyAmount }}* for *{{ fiatValue }}* at price {{ fixedRate }}.

Do you want to accept this trade?`,
      'init-get-confirm-sell': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} wants to sell *{{ cryptoCurrencyAmount }}* for *{{ fiatValue }}* at price {{ fixedRate }}.

Do you want to accept this trade?`,
      'trade-init-yes-cbbutton': 'Yes',
      'trade-init-no-cbbutton': 'No',
      'trade-init-no-response': `💤 *No Response*

This user is currently away. Please try other trades.`,
      'trade-init-expired': `⏳ *Trade expired*

Since you did not respond, the trade request ${
        BotCommand.TRADE
      }{{ tradeId }} has expired and cancelled.

You can pause your order easily if you are away. This ensures a good experience for other traders.`
    },
    'request-deposit-notify': `🛎  *New buy request*

You have a new buy request on your order ${BotCommand.ORDER}{{ orderId }}.

*{{ requesterName }}* wants to buy *{{ formattedCryptoValue }}* for *{{ formattedFiatValue }}*.

[Telegram contact](tg://user?id={{ requesterUserId }})

⚠️ You need to deposit the required funds before you can start this trade.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Order not found.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'You cannot open deal on your own order!',
      default: 'Sorry. An error occured. Please try again later.'
    },
    'next-cbbutton': 'next',
    'prev-cbbutton': 'prev',
    'show-buy-deals': `📉 *Quick Buy* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to buy from.

Price / {{ cryptoCurrencyCode }}, payment method, and trader rating are shown.
`,
    'show-sell-deals': `📈 *Quick Sell* ({{ currentPage}}/{{ totalPages }})

Select the order you want to sell to.

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Buyer Rating* are shown.
`,
    'id-verified': 'Verification: ✅ KYC verified',
    'show-buy-deal': `📉 *Buy {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

This deal is by *{{ realName }}*.
{{ verificationText }}
Account ID: ${BotCommand.ACCOUNT}{{ accountId }}
Rating:  {{ rating }} ⭐️

*Payment Details*:
-----------------
Payment Method: {{ paymentMethodName }}
Terms: _{{ terms }}_

*Trade Details*:
----------------
Price: {{ rate }} / {{ cryptoCurrencyCode }}
Buy Amount: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *Sell {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

This sell order is by *{{ realName }}*.
{{ verificationText }}
Account ID: ${BotCommand.ACCOUNT}{{ accountId }}
Rating:  {{ rating }} ⭐️

*Payment Details*:
-----------------
Payment Method: {{ paymentMethodName }}
Terms: _{{ terms }}_

*Trade Details*:
----------------
Price: {{ rate }} / {{ cryptoCurrencyCode }}
Sell Amount: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `Insufficient funds on traders account to start deal. Request the seller to deposit the funds after which the deal can begin.`,
    'request-buy-deal-deposit-cbbutton': '📲 Contact seller',

    'open-buy-deal-cbbutton': '🛎 Buy {{ cryptoCurrencyCode }} from here',
    'open-sell-deal-cbbutton': '🛎 Sell {{ cryptoCurrencyCode }} from here',
    'back-cbbutton': '⬅️ Back',
    'user-reviews': '💬 User reviews',
    'input-buy-amount': `💵  *Enter buy amount*

Enter {{ fiatCurrencyCode }} amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}*.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵  *Enter sell amount*

Enter {{ fiatCurrencyCode }} amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}*.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*Payment details*

Select or add new payment details for *{{ paymentMethodType }}* for the buyer to send you the money.`,
    'skip-input-payment-details': 'skip',
    'add-payment-details': '➕ Add {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*Open this trade?*

Are you sure you want to buy *{{ cryptoValue }}* for *{{ fiatValue }}* at price {{ rate }}?

❕ On clicking *'Yes'*, you agree to trade terms.`,

    'confirm-input-sell-amount': `*Open this trade?*

Are you sure you want to sell *{{ cryptoValue }}* for *{{ fiatValue }}* at price *{{ rate }}*?

❕ On clicking *'Yes'*, you agree to trade terms.`,
    'confirm-input-amount-yes-cbbutton': 'Yes',
    'confirm-input-amount-no-cbbutton': 'No',
    'show-open-deal-request': `📲 *Request sent!*

Your request has been sent, this deal will only start after the seller has deposited the required funds.

⚠️ IMPORTANT: Never make any payment before the deposit has been confirmed here. Do not make any deals outside MegaDeals, you risk losing your money.

*Seller's telegram contact*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'Deal canceled.',
    'trade-opened-message': 'Trade is active now!',
    'show-opened-trade': `*Trade* ${BotCommand.TRADE}{{ tradeId }}

Waiting for ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. If the user does not confirm the start of trade within {{ timeoutMinutes }} minutes, the deal will automatically cancel.

⚠️ IMPORTANT: For security reasons, do not make any trades outside MegaDeals.

Never cancel the transaction if you have already made the payment.

*Auto cancel in {{ timeoutMinutes }} minutes*`,
    'cancel-trade-cbbutton': '🚫 Cancel trade'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'Sell order @ {{ rate }}',
    'my-buy-order-cbbutton': 'Buy order @ {{ rate }}',
    'buy-deal-cbbutton': '🛎 Buy trade - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎 Sell trade - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 Deposit {{ cryptoCurrencyCode }}',
    'show-active-orders': `*Active Orders*

Your ongoing trades and orders created by you are listed.
`,
    'order-enabled': 'Your order is active now.',
    'input-payment-details-field': `Write your *{{ fieldName }}* for *{{ paymentMethod}}*`,
    'order-disabled': `Your order is set as inactive.
Click on *'Active'* button to enable this order.`,
    'show-orders': 'TODO: Show my orders',

    'terms-not-added': 'None',
    'my-buy-order-info': `📗  *My buy order* - ${BotCommand.ORDER}{{orderId}}

*Status*: {{ status }}
*{{ cryptoCurrencyCode }} Price*: {{ rate }}
*Min. amount*: {{ minAmount }}
*Max. amount*: {{ maxAmount }}
*Payment method*: {{ paymentMethod }}

Terms: _{{ terms }}_

*Order link*: {{ orderLink }}
Share this link. Whoever clicks on this link can open a trade with you.
`,
    'payment-info-not-added': 'Not added',
    'insufficient-sell-order-balance':
      '⚠️ Insufficient balance. Deposit the minimum amount to start deals on this order.',
    'my-sell-order-info': `*📕 My Sell Order* - ${BotCommand.ORDER}{{orderId}}

*Status*: {{ status }}
*{{ cryptoCurrencyCode }} price*: {{ rate }}
*Min. amount*: {{ minAmount }}
*Max. amount*: {{ maxAmount }}
*Payment method*: {{ paymentMethod }}
*Payment Info*: {{ paymentInfo }}

Terms: _"{{ terms }}"_

*Order link*: {{ orderLink }}
Share this link and open a deal directly with other traders.
`,
    'edit-amount-cbbutton': '⚖️ Amount',
    'edit-rate-cbbutton': '💸 BTC price',
    'edit-terms-cbbutton': '📝 Terms',
    'edit-payment-method-cbbutton': '💳 Payment method',
    'toggle-active-cbbutton': 'Active',
    'delete-order-cbbutton': '🗑️ Delete!',
    'edit-order': '✏️ Edit order',
    'go-back-cbbutton': '⬅️ back',
    'order-edit-success': '✅ Your order is updated.',
    'edit-payment-details': '📃 Update payment info',
    'order-edit-rate': `*Set {{ cryptoCurrencyCode }} price*

Enter the fixed price for {{ cryptoCurrencyCode }} in *{{ fiatCurrencyCode }}* or enter in percentage (%) to set a margin price.

Example: *{{ marketRate }}* or *2%*`,
    'order-edit-terms': `📋 *Terms*

Write your terms for the trade. This will be shown on your order.`,
    'order-delete-success': 'Order deleted'
  },

  'create-order': {
    show: `📝 *Create Order*

Select the order type.`,
    'new-buy-order-cbbutton': '📗  I want to buy',
    'new-sell-order-cbbutton': '📕  I want to sell',
    'input-fixed-rate': `*💸 Set {{ cryptoCurrencyCode }} price*

Enter a fixed price for {{ cryptoCurrencyCode }} in *{{ fiatCurrencyCode }}* or enter in percentage (%) to set a margin price.

Example: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 Set {{ cryptoCurrencyCode }} price*

Use margin price to set a dynamic price based on market rates. Use + / - percentage(%) to sell above or below the current market rate.

Current Market rate: {{ marketRate }} ({{ marketRateSource }})

Example: 3% or -2%`,
    'use-margin-price-cbbutton': 'ℹ️ Margin pricing',
    'use-fixed-price-cbbutton': '⬅️ Price',
    'back-cbbutton': '⬅️ back',
    'input-amount-limits': `⚖️ *Order amount*

Enter the order amount in *{{ fiatCurrencyCode }}*.

Example: Either 1000 or 500-1000 (min-max limit)`,
    'buy-order-created': '✅  Your buy order is created.',
    'sell-order-created': '✅  Your sell order is created.',
    'create-error': '❗️  Could not create this order. Please try again later.',
    'select-payment-method': `💳  *Payment Method*

Select a payment method.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'show more »'
  },

  'active-orders': {}
}
