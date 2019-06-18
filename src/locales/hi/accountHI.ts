import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountHI = {
  home: {
    'back-cbbutton': '⬅️ back',
    'more-cbbutton': 'more »',
    'no-reviews-available': 'No reviews',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *Review for* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

{{ reviewerName }} ne {{ tradeVolume }} {{ cryptoCurrencyCode }} trade kiya.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]:
        'Iss Account ID pe koi user nahi hai.🤷‍♂️ Please try again.'
    },
    account: `👤  *My Account*
    
Account ID: ${BotCommand.ACCOUNT}{{ accountID }}
    
💵 *Trade cound:* {{ dealCount }}
💎 *Volume:* {{ tradeVolume }}
⭐ *Rating:* {{ rating }}
    
🤝 Referrals: {{ referralCount }} users
💰 Referral Earnings: {{ earnings }}
    
💳 *Payment Methods:* {{ paymentMethods }}`,

    'dealer-account': `*Account* (${BotCommand.ACCOUNT}{{ accountId }})

Telegram: @{{ telegramUsername }}

💵 *Trade Deals:* {{ dealCount }}
💎 *Trade volume:* {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ *Rating:* {{ rating }}`,

    'send-message-dealer-cbbutton': '📝 Message bhejo',
    'user-reviews-cbbutton': '💬 Reviews ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️  User ko block karo',
    'unblock-dealer-cbbutton': 'User unblock karo',
    'verify-account-cbbutton': '✅ Apni pehchaan Verify karo',
    'manage-payment-methods-cbbutton': '💳  Payment Methods',
    'referral-link-cbbutton': '🤝  Referral',
    'settings-cbbutton': '️⚙️ Settings',
    'no-payment-method': `None`
  },

  'payment-method': {
    'does-not-exist': `❌ *Error*

Ye payment method complete nahi ho paaya.
    
Aap humare support chat @{{ supportBotUsername }} se chat karke payment add karwa sakte hain.`,

    'create-error':
      'Yeh payment method add nhi hua. Thodi der baad fir se try karein.',
    'edit-cbbutton': '🖋  Payment method edit',
    'add-cbbutton': '➕  Naya Payment Method add',
    'show-all': `💳 *Payment Methods*

{{ paymentMethodsList }}`,
    'show-edit': `*Payment methods edit karein:*

Kaunsa payment method *edit* karna chahte hai? 👇`,
    'select-to-add': `*Select*

Jo *Naya payment method* add karna chahte hai usko select karein: 👇`,
    'edit-enter-field': 'Enter the *{{ fieldName }}*',
    created: `✅ Payment method *added*

Your payment method is added.

{{ paymentMethodInfo }}

❕You can now use this to receive money when selling cryptocurrency.`,
    updated: `✅ Payment method *updated*.

Aapka payment method update kar diya hai.

{{ paymentMethodInfo }}`,
    'none-added': `❕ Aapne payment method add nhi kiya hai. Payment method add karne par hi aapko sell trade par money transfer kar payenge.`
  },

  referral: {
    'show-info': `🤝 *Friends refer karein*

*Referral count*: {{ referralCount }} users
*Referral fees*: {{ referralFeesPercentage }}%
(apke referral se jo fees hum lenge trade karne par uska % bhaag aapke account mein credit ho jayega)

Apne friends or jaan pehchaan walon ko invite bhejo aur bitcoins earn karo. Aapke friends/referral jo bhi BTC trade karenge uska ek bhaag aapko diya jayega.
Jab aapke friends trading shuru karenge tab har ek trade pe aapko transaction fee mein se 90% aapke account mein credit kar diya jayega. 

Example: Jab aapka referral 5 BTC trade Megadeals app pe karenge toh aapko 0.045 BTC milega aur hum 0.005 BTC service fee lenge. 

Aapka referral amount har din aapke wallet mein credit ho jayega. Yeh referral program kabhi end nhi hoga aur aap isee jitne chahe utne friends and relatives ke saath share kar sakte hai. 

Niche diye hue message ko copy karein aur share karein apne friends ke saath. 👇`
  },

  settings: {
    'invalid-username': `❌ *Error*
  
This Account ID is invalid. Please check the ID you've entered and try again.`,

    'update-success': 'changed',
    'username-show': `👤 *Enter Account ID*

Only english letters and numbers between 3 and 15 characters.

NOTE: This action is final, you wont be able to change your Account ID again.
`,
    'back-to-settings-cbbutton': '⬅️  Back',
    'settings-currency-updated': `✅ Your currency is updated to *{{ updatedCurrencyCode }}*`,
    'show-rate-source': `📊 *Rate source*

BTC ka exchange rate ka source select karein.
Active exchange rate source: {{ exchangeSource }}.

⚠️ Note: Rate Source change karne se aapke active orders jispe margin pricing set hua hai uska price change hoga..
`,
    'show-more': 'more »',
    'show-currency': `💵 *Currency*
  
Aapka active currency abhi {{ fiatCurrencyCode }} hai. List mein diye gaye *currency* mein se ek *select* karein. Baaki ke currency list ke liye "More" button dabayein.`,
    'show-language': `🌎 *Language*

App use karne ka *language choose* kariye. 

Dhyaan mein rakhein:

1. Woh language choose karein jisko aap pad aur samajh sakte hain.
2. Language change karne se pehle bheje gaye messages (sent and recieved) ka language change nahi hoga.

Active «*{{ language }}*»`,
    'currency-cbbutton': '💵 Currency',
    'language-cbbutton': '🌎 Language',
    'rate-source-cbbutton': '📊 Rate source',
    'show-settings': `⚙️ *Settings*

Aap kya edit karne chahte hai?`,
    'username-cbbutton': '👤  Change Acc ID'
  }
}
