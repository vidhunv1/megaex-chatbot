import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeEN = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  24/7 support via {{ supportBotUsername }}
🔒  All trades are secured with the bot as guarantor

*Market rate*: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'My Active ({{ orderCount }})',
    'create-order-cbbutton': '📊 Create Order',
    'buy-cbbutton': '📉 Quick Buy',
    'sell-cbbutton': '📈 Quick Sell'
  },

  deals: {
    'no-quick-sell': `📉 *Quick Buy*

There are no active buy orders. Click to create a new buy order.`,
    'new-quick-sell-cbbutton': '📗 New buy order',
    'no-quick-buy': `📉 *Quick Sell*

There are no active sell orders. Click to create a new sell order.`,
    'new-quick-buy-cbbutton': '📕 New sell order',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓 *Dispute resolved*

After careful review based on proofs, our legal team has confirmed that there was no issue on your side.

Appropriate action has been taken against the buyer, we are sorry for any inconvinience caused, .

*The locked funds has been released back to you.*`,
      'dispute-resolved-buyer-win': `👩‍🎓 *Dispute resolved*

After careful review based on proofs, our legal team has confirmed that there was no issue on your side.

Appropriate action has been taken against the seller, we are sorry for any inconvinience caused, a.

*{{ cryptoAmount }} has been credited to your wallet*`,
      'dispute-resolved-seller-lose': `👩‍🎓 *Dispute resolved*

After careful review based on proofs, our legal team has confirmed that there was a fault on your side.

*NOTE: Repeated offence will result in a permanent ban.*`,
      'dispute-resolved-buyer-lose': `‍🎓 *Dispute resolved*

After careful review based on proofs, our legal team has confirmed that there was a fault on your side.

*NOTE: Repeated offence will result in a permanent ban.*`,
      'referral-comission': `🚀 *Comission Received*

You received {{ cryptoAmount }} referral comission from your referrals trade.`,
      'open-dispute-cbbutton': '👩‍🎓 Open Issue',
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

Your wallet is credited with *{{ cryptoAmount }}* from this trade.`,
      'payment-released-seller': `🚀 *Trade success* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}* was sent to the buyer.`,
      'give-rating': `🏅 *Rate this trade*

Give your rating for this trade.`,
      'give-review': `🗣 *Trade review*

Write your short review for this trade`,
      'end-review': `*Added your review!*

🎉 _Invite your friends and family here so they can also have the best experience to buy/sell bitcoins (Use your referral link so you can earn from their trades)._

{{ referralLink }}`,
      'skip-review': 'Skip ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*Confirm*

Are you sure you have sent *{{ fiatAmount }}* to the sellers *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'Yes',
      'confirm-payment-sent-no-cbbutton': 'No',
      'payment-sent-buyer': `*🛎 Trade* ${BotCommand.TRADE}{{ tradeId }}

Seller has been notified. Please wait for the the seller to confirm your payment.

❕Please wait for sometime, If there is no confirmation you can contact *Open Issue*.`,
      'payment-sent-seller': `*🛎 Payment confirmed* ${
        BotCommand.TRADE
      }{{ tradeId }}

The buyer has sent *{{ fiatAmount }}* to your *{{ paymentMethod }}*. Please confirm when you receive this transaction.

❕If you have not received this transaction in some time you can contact *Open Issue*.`,
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
      'cancel-trade-success': 'This trade was canceled by you.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'The trade was already canceled or expired.',
      'cancel-trade-notify': `❗️The trade ${
        BotCommand.TRADE
      }{{ tradeId }} was canceled by the user.`,
      'trade-rejected-notify':
        '❗ The user cancelled this trade. You can choose other good deals under Quick Buy / Sell.',
      'trade-rejected-success': 'You rejected this trade.',
      'trade-accepted-seller-success': `🛎 *Trade Open* ${
        BotCommand.TRADE
      }{{ tradeId }}

The user has been notified to deposit *{{ fiatPayAmount }}* in your *{{ paymentMethodName }}*.

[Telegram contact](tg://user?id={{ buyerUserId }})

❕You will be notified when this payment has been marked as completed.`,
      'trade-accepted-buyer-no-payment-info':
        'Send a message to seller for the payment details.',
      'trade-accepted-buyer': `🛎 *Trade Accepted* ${
        BotCommand.TRADE
      }{{ tradeId }}

Make a payment of {{ fiatPayAmount }} through {{ paymentMethodName }}, you will receive *{{ cryptoAmount }}* when your payment is confirmed.

*{{ paymentMethodName }}*
Amount: *{{ fiatPayAmount }}*
Payment reference: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram contact](tg://user?id={{ telegramUserId }})

🔒 _This trade is secured. Payment valid only for_ *{{ paymentSendTimeout }} mins*.`,
      'payment-received-cbbutton': '💵  Payment Received',
      'payment-sent-cbbutton': '💸  I have paid',
      'trade-accepted-fail':
        '️❗️ Sorry. There was an error in opening this trade.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❌ You already have an existing trade on this order. You cannot place multiple trades for the same order.',
        [TradeError.NOT_FOUND]: '❌ We could not find this trade.',
        [TradeError.TRADE_EXPIRED]: '❌ This trade is invalid or expired.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❌ You have insufficient balance to open this trade'
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

*{{ requesterName }}* wants to buy *{{ formattedCryptoValue }}* for *{{ formattedFiatValue }}*.

[Telegram contact](tg://user?id={{ requesterUserId }})

⚠️ You need to deposit the required funds before you can start this trade.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Order not found.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'You cannot open deal on your own order!',
      default: '❗️ Sorry. An error occured. Please try again later.'
    },
    'next-cbbutton': 'next',
    'prev-cbbutton': 'prev',
    'show-buy-deals': `📉 *Quick Buy* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to buy from.

*Price / {{ cryptoCurrencyCode }}*, *Payment Method* and *Seller Rating* are shown.
`,
    'show-sell-deals': `📈 *Quick Sell* ({{ currentPage}}/{{ totalPages }})

Please select the order you want to sell to.

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

    'show-sell-insufficient-funds': `❗️ There is not enough balance on sellers account to start this deal. You can request the seller to deposit the funds after which you can start the trade again.`,
    'request-buy-deal-deposit-cbbutton': '📲 Contact seller',

    'open-buy-deal-cbbutton': '🛎  Buy {{ cryptoCurrencyCode }} here',
    'open-sell-deal-cbbutton': '🛎  Sell {{ cryptoCurrencyCode }} here',
    'back-cbbutton': '⬅️  Back',
    'user-reviews': '💬 user reviews',
    'input-buy-amount': `💵 *Input buy amount*

Enter {{ fiatCurrencyCode }} amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}*.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵 *Input sell amount*

Enter {{ fiatCurrencyCode }} amount between *{{ minFiatValue }}* and *{{ maxFiatValue }}*.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*Payment details*

Select or add new payment details for *{{ paymentMethodType }}* for the buyer to send you the money.`,
    'skip-input-payment-details': 'skip',
    'add-payment-details': '➕ Add {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*Open this trade?*

Are you sure you want to buy *{{ cryptoValue }}* for *{{ fiatValue }}* at rate {{ rate }}?

❕By continuing you agree to the deal terms.`,

    'confirm-input-sell-amount': `*Open this trade?*

Are you sure you want to sell *{{ cryptoValue }}* for *{{ fiatValue }}* at rate *{{ rate }}*?

❕By continuing you agree to the deal terms.`,
    'confirm-input-amount-yes-cbbutton': 'Yes',
    'confirm-input-amount-no-cbbutton': 'No',
    'show-open-deal-request': `📲 *Request sent!*

Your request has been sent, this deal will only start after the seller has deposited the required funds.

⚠️ *IMPORTANT*: Never make any payment before the deposit has been confirmed here. Do not make any deals outside this bot, you risk losing your money.

*Seller's telegram contact*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'Deal canceled.',
    'trade-opened-message': 'Trade is active now!',
    'show-opened-trade': `*Trade* ${BotCommand.TRADE}{{ tradeId }}

Waiting for ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. If user does not confirm the start of trade within {{ timeoutMinutes }} minutes, the deal will automatically cancel.

⚠️️⚠️️ *NOTE*: For your security do not make any trades outside this bot.

You can cancel the deal any time. Keep in mind that the money you have sent will not return if you cancel the transaction.

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
    'order-enabled': 'Your order is *active* now.',
    'input-payment-details-field': `Write your *{{ fieldName }}* for *{{ paymentMethod}}*`,
    'order-disabled': `Your order is *inactive* now.
click on *'Active'* button to enable this order.`,
    'show-orders': 'TODO: Show my orders',

    'terms-not-added': 'None',
    'my-buy-order-info': `*📗 My Buy Order* - ${BotCommand.ORDER}{{orderId}}

*Status*: {{ status }}
*Rate {{ cryptoCurrencyCode }}*: {{ rate }}
*Min. amount*: {{ minAmount }}
*Max. amount*: {{ maxAmount }}
*Payment method*: {{ paymentMethod }}

Terms: _{{ terms }}_

*Link for your order*: {{ orderLink }}
Share this link, anyone who clicks on this link can directly open a trade with you.
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

*Link for your order*: {{ orderLink }}
Share this link, anyone who clicks on this link can directly open a deal with you.
`,
    'edit-amount-cbbutton': '⚖️ Amount',
    'edit-rate-cbbutton': '💸 Rate BTC',
    'edit-terms-cbbutton': '📝 Terms',
    'edit-payment-method-cbbutton': '💳 Payment method',
    'toggle-active-cbbutton': 'Active',
    'delete-order-cbbutton': '🗑️ Delete!',
    'edit-order': '✏️  Edit order',
    'go-back-cbbutton': '⬅️  Back',
    'order-edit-success': '✅ Your order is updated.',
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
    'new-buy-order-cbbutton': '📗  I want to buy',
    'new-sell-order-cbbutton': '📕  I want to sell',
    'input-fixed-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Enter the fixed rate of {{ cryptoCurrencyCode }} for this order in *{{ fiatCurrencyCode }}* or enter in *percents* to set a margin price.

Example: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Margin price lets you set a dynamic rate for your order based on market rates. Use a positive or negative percentage to sell above or below the current market rate.

*Current Market rate*: {{ marketRate }} ({{ marketRateSource }})

Example: *3%* or *-2%*`,
    'use-margin-price-cbbutton': 'ℹ️ Margin pricing',
    'use-fixed-price-cbbutton': '⬅️ Rate',
    'back-cbbutton': '⬅️  Back',
    'input-amount-limits': `⚖️ *Order amount*

Enter the order amount in *{{ fiatCurrencyCode }}*.

For Example: Either *1000* or *500-1000* (set min-max limit)
`,
    'buy-order-created': '✅ Your *Buy order created*',
    'sell-order-created': '✅ Your *Sell order created*',
    'create-error': '❌ Could not create this order. Please try again later.',
    'select-payment-method': `💳 *Payment Method*

Select the payment method`,
    'my-pm-cbbutton': 'My {{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'show more »'
  },

  'active-orders': {}
}
