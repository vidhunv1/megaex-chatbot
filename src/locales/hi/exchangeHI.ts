import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeHI = {
  home: {
    exchange: `💵  *Exchange BTC-{{ fiatCurrency }}*

✅  Aapko 24/7 support  milega {{ supportBotUsername }}
🔒  Saare trade MegaDeals bot pe secure hai aur bot guarantor hoga trade poora hone tak.

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
      'referral-comission': `🚀 *Comission Received*

You received {{ cryptoAmount }} referral comission from your referrals trade.`,
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
      'cancel-trade-success': 'Yeh trade cancel ho gya hai.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'Yeh trade cancel ya fir expire ho gya hai.',
      'cancel-trade-notify': `❗️User ne yeh trade ${
        BotCommand.TRADE
      }{{ tradeId }} cancel kar diya hai.`,
      'trade-rejected-notify':
        '❗ User ne yeh trade cancel kar diya hai. Aap aur ache deals dekh sakte hain Quick Buy / Sell option mein.',
      'trade-rejected-success': 'You rejected this trade.',
      'trade-accepted-seller-success': `🛎 *Trade Open* ${
        BotCommand.TRADE
      }{{ tradeId }}

      User ko humne soochna de di hai ki aapko *{{ fiatPayAmount }}* de di jaaye *{{ paymentMethodName }} ke dwara*.

[Telegram contact](tg://user?id={{ buyerUserId }})

❕Jab payment poora ho jaayega hum aapko soochit kar denge.`,
      'trade-accepted-buyer-no-payment-info':
        'Send a message to seller for the payment details.',
      'trade-accepted-buyer': `🛎 *Trade Accepted* ${
        BotCommand.TRADE
      }{{ tradeId }}

Seller ke *{{ paymentMethodName }}* account pe *{{ fiatPayAmount }}* bhej dijiye, Payment confirm hone ke baad *{{ cryptoAmount }}* apke account mein credit ho jayega.
*{{ paymentMethodName }}*
Amount: *{{ fiatPayAmount }}*
Payment reference: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram contact](tg://user?id={{ buyerUserId }})

🔒 Humne yeh trade secure kar diya hai aapke liye. Aapko payment *{{ paymentSendTimeout }} mins* ke andar karna hoga.`,
      'payment-received-cbbutton': '💵  Payment Received',
      'payment-sent-cbbutton': '💸 Payment kar diya',
      'trade-accepted-fail':
        '️❗️ Sorry. Trade complete hone mein koi error hai.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❌ Iss order pe trade open hai. Aap ek hi order pe multiple trades nhi daal sakte hai. Poorana trade cancel karke fir try karein.',
        [TradeError.NOT_FOUND]: '❌ Sorry. Yeh trade mein kuch error hai.',
        [TradeError.TRADE_EXPIRED]:
          '❌ Yeh trade invalid ya expire ho chuka hai.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❌ You have insufficient balance to open this trade'
      },
      'init-get-confirm-buy': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} ko *{{ fiatValue }}* mein *{{ cryptoCurrencyAmount }}* kharidne hai.

Kya aap trade karna chahenge?`,
      'init-get-confirm-sell': `🛎 *New Trade* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} ko *{{ fiatValue }}* mein *{{ cryptoCurrencyAmount }}* bech rha hai at rate {{ fixedRate }}.

Kya aap trade karna chahenge?`,
      'trade-init-yes-cbbutton': 'Yes',
      'trade-init-no-cbbutton': 'No',
      'trade-init-no-response': `💤 *No Response*

Yeh user abhi unavailable hai. Thodi der baad fir se try karein.`,
      'trade-init-expired': `⏳ *Trade expire ho gya hai.*

Yeh trade request ${
        BotCommand.TRADE
      }{{ tradeId }} expire ho gya aur no response milne par humne yeh trade cancel kar diya hai.

❕️ Aap yeh trade pause kar sakte hai agar koi reason se aap ko lagta hai ki aap busy hai. Hum user ko message ke dwara notify kar denge.`
    },
    'request-deposit-notify': `🛎 *New Match*

Aapke order ${BotCommand.ORDER}{{ orderId }} pe ek new buy request hai.

*{{ requesterName }}* ne *{{ formattedCryptoValue }}* buy request daala hai*{{ formattedFiatValue }}*.

[Telegram contact](tg://user?id={{ requesterUserId }})

⚠️ Trade shuru karne se pehle apne wallet mein {{ cryptoCurrencyCode }} funds daale.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Order active nahi hai.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'Aap apne order pe buy / sell request nahi daal sakte hain. Aur koi order pe request daalein.',
      default: '❗️ Sorry. Kuch der baad fir se try karein.'
    },
    'next-cbbutton': 'next',
    'prev-cbbutton': 'prev',
    'show-buy-deals': `📉 *Quick Buy* ({{ currentPage}}/{{ totalPages }})

Jo trade order ka price sahi lag rha hai, *buy* karne ke liye select karein,

Har trade mein; *price / {{ cryptoCurrencyCode }}*, *payment method*, and *trader rating* display kiya jaa rha hai.`,
    'show-sell-deals': `📈 *Quick Sell* ({{ currentPage}}/{{ totalPages }})

Jo trade order ka price sahi lag rha hai, *sell* karne ke liye select karein,

Har trade mein; *price / {{ cryptoCurrencyCode }}*, *payment method*, and *trader rating* display kiya jaa rha hai.
`,
    'show-buy-deal': `📉 *Buy {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

Yeh buy order ko set user *{{ realName }}* ne kiya hai.
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

    'show-sell-insufficient-funds': `❗️ Trader ke account mein balance low hai. Trader ko message karke funds deposit karne ko kaho, uske baad yeh trade ko fir se start karein.`,
    'request-buy-deal-deposit-cbbutton': '📲 Contact seller',

    'open-buy-deal-cbbutton': '🛎  Buy {{ cryptoCurrencyCode }} here',
    'open-sell-deal-cbbutton': '🛎  Sell {{ cryptoCurrencyCode }} here',
    'back-cbbutton': '⬅️  Back',
    'user-reviews': '💬 user reviews',
    'input-buy-amount': `💵 *Kitna buy karna chahenge?*

Buy Amount enter karein ({{ fiatCurrencyCode }} or {{ cryptoCurrencyCode }}):

{{ fiatCurrencyCode }} amount ka limit: minimum: *{{ minFiatValue }}* aur maximum: *{{ maxFiatValue }}*.

{{ cryptoCurrencyCode }} amount ka limit: minimum: *{{ minCryptoValue }}* aur *{{ maxCryptoValue }}*.

Amount enter karke last mein {{ cryptoCurrencyCode }} / {{ fiatCurrencyCode }} add karein.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵 *Kitna buy karna chahenge?*

Sell Amount enter karein ({{ fiatCurrencyCode }} or {{ cryptoCurrencyCode }}):

{{ fiatCurrencyCode }} amount ka limit: minimum: *{{ minFiatValue }}* aur maximum: *{{ maxFiatValue }}*.

{{ cryptoCurrencyCode }} amount ka limit: minimum: *{{ minCryptoValue }}* aur *{{ maxCryptoValue }}*.

Amount enter karke last mein {{ cryptoCurrencyCode }} / {{ fiatCurrencyCode }} add karein.

For example: 1000 {{ fiatCurrencyCode }}`,
    'input-payment-details': `*Payment details*

Select or add new payment details for *{{ paymentMethodType }}* for the buyer to send you the money.`,
    'skip-input-payment-details': 'skip',
    'add-payment-details': '➕ Add {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*Buy Trade open karna hai?*

Kya aap yeh *buy trade confirm* karna chahenge? Buy Trade: *{{ fiatValue }}* mein *{{ cryptoValue }}* at the rate {{ rate }}?

❕*'Yes'* select karne par, aap trade terms ko agree kar rahe hain`,

    'confirm-input-sell-amount': `*Sell Trade open karna hai?*

Kya aap yeh *sell trade confirm* karna chahenge? Sell Trade: *{{ cryptoValue }}* for *{{ fiatValue }}* at the rate *{{ rate }}*?

❕*'Yes'* select karne par, aap trade terms ko agree kar rahe hain`,
    'confirm-input-amount-yes-cbbutton': 'Yes',
    'confirm-input-amount-no-cbbutton': 'No',
    'show-open-deal-request': `📲 *Request sent!*

    Aapka trade request send kar diya gya hai. Jab seller required {{ cryptoCurrencyCode }} funds deposit karega tab yeh trade start ho jayega.

⚠️ *IMPORTANT*: Jab tak hum seller se {{ cryptoCurrencyCode }} funds deposit ka confirmation aapko nhi bhejte hain tab tak aap payment nhi start karna. MegaDeals app ke bahar trade and deals mat karna. Agar bot ke bahar trade karoge toh MegaDeals koi guarantee nhi dega. Aise cases mein, aapka money risk mein hoga.

*Seller's telegram contact*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'Deal canceled.',
    'trade-opened-message': 'Trade is active now!',
    'show-opened-trade': `*Trade* ${BotCommand.TRADE}{{ tradeId }}

Waiting for ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. Agar user trade confirmation {{ timeoutMinutes }} minutes mein nhi karega toh deal automatically cancel ho jayega.

⚠️⚠️ *IMPORTANT*: Security reasons ke reasons se, MegaDeals app ke bahar trade nhi kariye.

Aap kisi bhi time pe trade cancel kar sakte hain. *Payment karne ke baad* trade cancel karne se *aapka payment wapis nhi milega*. Isliye trade cancel karne se pehle soch ke steps uthaiyen.

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

Aapka active and ongoing deals and orders ka list:
`,
    'order-enabled': 'Aapka order ab *active* hai.',
    'input-payment-details-field': `Apna *{{ fieldName }}* for *{{ paymentMethod}}* enter karein.`,
    'order-disabled': `Aapka order *inactive* hai.
Apna order fir se active karne ke liye; *'Active'* button pe click karein.`,
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
Anyone who clicks on this link can directly open a trade with you.
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
Jo bhi iss link pe click karega woh aapke saath trade open kar sakta hai.`,
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

    Iss order mein {{ cryptoCurrencyCode }} ka rate set karein. Aap margin pricing (in percentage %) OR fixed price set kar sakte hain.

Example: *2%* or *{{ marketRate }}*`,
    'order-edit-terms': `📝 *Terms*

Iss trade ka terms likhein. User ko order mein trade terms read karne ka option hai.`,
    'order-delete-success': 'Order deleted'
  },

  'create-order': {
    show: `📊 *Create Order*

Select the order type.`,
    'new-buy-order-cbbutton': '📗  New buy order',
    'new-sell-order-cbbutton': '📕  New sell order',
    'input-fixed-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Order type select karein. Aapka orders baaki traders ko dikhega aur woh aapke saath {{ cryptoCurrencyCode }} buy / sell deal kar sakte hain. Traders ko Quick Buy / Sell mein aapka trade dikhega.

Example: *{{ marketRate }}*

Margin pricing set karne niche diye button pe click karein:`,
    'input-margin-rate': `*💸 Rate {{ cryptoCurrencyCode }}*

Margin price pe buy / sell karne ke liye, enter your price (in %).

Agar aap market price ke niche buy / sell karna chahte hai, toh negative (*-2%*) symbol use karein.

*Current BTC market rate*: {{ marketRate }} ({{ marketRateSource }})

Example: *2%*`,
    'use-margin-price-cbbutton': 'Use margin pricing (%) ➡️',
    'use-fixed-price-cbbutton': '⬅️ Use fixed pricing',
    'back-cbbutton': '⬅️  Back',
    'input-amount-limits': `⚖️ *Order amount*

Apna buy / sell amount daalein (in *{{ fiatCurrencyCode }}*):

Example: *1000* or *500-1000* (set min-max limit)`,
    'buy-order-created': '✅ Your *Buy Order* daal diya gya hai.',
    'sell-order-created': '✅ Aapka *Sell Order* daal diya gya hai.',
    'create-error': '❌ ❗️Sorry. Yeh order nhi update hua. Fir se try karein.',
    'select-payment-method': `💳 *Payment Method*

Apna payment method select karein`
  },

  'active-orders': {}
}
