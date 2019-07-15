import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountHI = {
  home: {
    'passport-data-received': `✅ *आइडी मिल गई है*

आपके सत्यापन दस्तावेज प्राप्त हो गए हैं। इसे 3 कार्य घंटों में संसाधित किया जाना चाहिए। इसके संसाधित होने पर हम आपको सूचित करेंगे।`,
    'trade-message': `ट्रेड् देखना ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 संदेश लिखो',
    'send-response-cbbutton': '📝 वापिस लिखें',
    'message-sent': 'मैसेज बेजा दिया गया है!',
    'new-photo-message': `📨 ${
      BotCommand.ACCOUNT
    }{{ accountId }} <b>की तरफ से संदेश</b>
{{ tradeInfo }}
Received photo`,
    'message-not-sent': '❗️ भेजने में विफल.',
    'enter-message': 'उपयोगकर्ता के लिए संदेश दर्ज करें। (अधिकतम 400 वर्ण)',
    'new-message': `📨 ${
      BotCommand.ACCOUNT
    }{{ accountId }} <b>की तरफ से संदेश</b>

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ वापस',
    'more-cbbutton': 'अगला »',
    'no-reviews-available': 'कोई रिव्यू नहीं.',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *के लिये रिव्यू* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

 *{{ reviewerName }}* की ओर से रिव्यू। {{ tradeVolume }} {{ cryptoCurrencyCode }} के लिए ट्रेड् किया गया.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'यह खाता नहीं ढूंढ सका।'
    },
    account: `👤  *मेरा खाता*

खाता आइडी: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *कुल ट्रेड्:* {{ dealCount }}
💎 आद्यतन मात्रा: {{ tradeVolume }}
⭐ रेटिंग: {{ rating }}

🤝 रेफरल आमंत्रित: {{ referralCount }} उपयोगकर्ताओं
💰 रेफ़रल कमाई: {{ earnings }}

💳 *Payment Methods:* {{ paymentMethods }}`,

    'dealer-account': `*खाता विवरण* (${BotCommand.ACCOUNT}{{ accountId }})

[{{ firstName }} संपर्क करें](tg://user?id={{ telegramUserId }})

💵 कुल ट्रेड्: {{ dealCount }}
💎 ट्रेड् मात्रा: {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ रेटिंग: {{ rating }}`,

    'user-reviews-cbbutton': '🗣 रिव्यू ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️ उपयोगकर्ता को ब्लॉक करें',
    'unblock-dealer-cbbutton': 'उपयोगकर्ता को अनब्लॉक करें',
    'verify-account-cbbutton': '🆔 KYC सत्यापित करें',
    'manage-payment-methods-cbbutton': '💳 भुगतान की विधि',
    'referral-link-cbbutton': '🤝 रेफरल',
    'settings-cbbutton': '️⚙️ सेटिंग्स',
    'no-payment-method': `शून्य`
  },

  'payment-method': {
    'does-not-exist': `❗️  *अमान्य भुगतान विधि*

यह भुगतान विधि मौजूद नहीं है।

आप उचित भुगतान विधि को जोड़ने के लिए @{{ supportBotUsername }} से अनुरोध कर सकते हैं।`,

    'create-error':
      'माफ़ कीजिये। हम यह भुगतान विधि नहीं बना सके। बाद में पुन: प्रयास करें।',
    'edit-cbbutton': '🖋  भुगतान विधियों को संपादित करें',
    'add-cbbutton': '➕  भुगतान विधि जोड़ें',
    'show-all': `💳 *भुगतान की विधि*

{{ paymentMethodsList }}`,
    'show-edit': `*भुगतान विधि संपादित करें*

उस भुगतान विधि पर क्लिक करें जिसे आप संपादित करना चाहते हैं।`,
    'select-to-add': `*भुगतान विधि चयन*

नीचे दिए गए विकल्पों में से अपनी भुगतान विधि चुनें।`,
    'edit-enter-field': '*{{ fieldName }}* दर्ज करें',
    created: `✅ *नया* भुगतान विधि

आपकी भुगतान विधि जोड़ी जा चुकी है।

{{ paymentMethodInfo }}
{{CryptoCurrencyCode}} बेचते समय आप धन प्राप्त करने के लिए इसका उपयोग कर सकते हैं.`,
    updated: `✅ *भुगतान विधि अपडेट*

आपकी भुगतान विधि अपडेट की गई है।

{{ paymentMethodInfo }}`,
    'none-added': `कोई भुगतान विधियाँ नहीं है। जब आप BTC बेच रहे हों तो उन विधियोन मे धन डाल दिया जायेगा।`
  },

  referral: {
    'show-info': `🤝  *रेफ़ेर करेन और कमाएँ*

आपका रेफरल काउंट: {{ referralCount }} उपयोगकर्ताओं
रेफरल शुल्क: {{ referralFeesPercentage }}%

बिटकॉइन कमाएं हर ट्रेड के साथ जो आपका रेफरल करता है। आपको शुल्क का {{referralFeesPercentage}}% मिलेगा।

उदाहरण के लिए: यदि आपका रेफरल ट्रेड 1 बीटीसी करता है, तो आप 0.008 BTC जो हम शुल्क के रूप में लेते हैं उस्मे से 0.004 BTC आप को दे दिया जायेगा।

संसाधित किया गया और आपके बटुए में तुरंत क्रेडिट कर दिया गया। कोई सीमा नहीं और कोई समाप्ति तिथि नहीं।

नीचे दिए गए संदेश को कॉपी करें और शेयर करें। 👇`
  },

  settings: {
    'invalid-username': `❌ *त्रुटि*

यह खाता आईडी अमान्य है। कृपया आपके द्वारा दर्ज की गई आईडी की जाँच करें और पुनः प्रयास करें।`,

    'update-success': 'बदल दीया गया है',
    'username-show': `👤 *खाता आईडी दर्ज करें*

केवल अंग्रेजी अक्षरों और संख्याओं के बीच 3 और 15 अक्षर।

नोट: यह क्रिया अंतिम है, आप फिर से अपना खाता आईडी नहीं बदल पाएंगे।
`,
    'back-to-settings-cbbutton': '⬅️ वापस',
    'settings-currency-updated': `आपकी मुद्रा को *{{ updatedCurrencyCode }}* अपडेट किया गया है।`,
    'show-rate-source': `📊 *दर स्रोत*

उस स्रोत का चयन करें जिसका आप उपयोग करना चाहते हैं।
अभी ऐक्टिव: *{{ exchangeSource }}*.

नोट: यदि आपने मार्जिन मूल्य निर्धारण का उपयोग किया है तो इसे बदलने से आपके सक्रिय आरडर प्रभावित होंगे।
`,
    'show-more': 'अगला »',
    'show-currency': `💵 *मुद्रा*

अपनी मुद्रा बदलने के लिए क्लिक करें।

आप * {{fiatCurrencyCode}} * का उपयोग कर रहे हैं। एक मुद्रा का चयन करें। अन्य उपलब्ध मुद्राओं को देखने के लिए "अगला" पर क्लिक करें।`,
    'show-language': `🌎 *भाषा*

ऐप के लिए भाषा चुनें।

नोट: पुराने संदेशों (भेजे और प्राप्त) को नई भाषा में नहीं बदला जाएगा।

अभी ऐक्टिव: *{{ language }}*`,
    'currency-cbbutton': '💵 मुद्रा',
    'language-cbbutton': '🌎 भाषा',
    'rate-source-cbbutton': '📊 दर स्रोत',
    'show-settings': `⚙️ सेटिंग्स

What do you want to edit?`,
    'username-cbbutton': '👤  खाता आईडी बदलें'
  }
}
