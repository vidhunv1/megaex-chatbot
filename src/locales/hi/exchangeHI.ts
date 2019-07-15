import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeHI = {
  home: {
    exchange: `💵  *एक्सचेंज BTC-{{ fiatCurrency }}*

✅  {{ supportBotUsername }} के माध्यम से 24/7 समर्थन
🔒  सभी ट्रेडों को एस्क्रो गारंटी के साथ सुरक्षित किया जाता है.

बाज़ार दर: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'मेरा ऐक्टिव आरडर({{ orderCount }})',
    'create-order-cbbutton': '📊 आरडर बनाएँ',
    'buy-cbbutton': '📉 BTC खरीदें',
    'sell-cbbutton': '📈 BTC बेचें'
  },

  deals: {
    'no-quick-sell': `📈  *BTC बेचें*

कोई BTC बेचने का ऐक्टिव आरडर नहीं है। एक नया आरडर बनाएं।`,
    'new-quick-sell-cbbutton': '📗 नया खरीदने का आरडर',
    'no-quick-buy': `📉  *BTC खरीदें*

कोई BTC खरीदने का ऐक्टिव आरडर नहीं है। नया विक्रय आदेश बनाएँ।`,
    'new-quick-buy-cbbutton': '📕 नया बेचने का आरडर',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *विवाद सुलझ गया*

दोनों पक्षों द्वारा प्रस्तुत सबूत के आधार पर सावधानीपूर्वक समीक्षा के बाद, हम पुष्टि करते हैं कि आप व्यापार के साथ अपने हिस्से पर वास्तविक हैं।

खरीदार के खिलाफ उचित कार्रवाई की गई है। किसी भी असुविधा के लिए हमें खेद है।

लॉक किए गए BTC फंड्स को * जारी किया गया है। अपने वॉलेट की जाँच करें।`,
      'dispute-resolved-buyer-win': `👩‍🎓  *विवाद सुलझ गया*

दोनों पक्षों द्वारा प्रस्तुत सबूत के आधार पर सावधानीपूर्वक समीक्षा के बाद, हम पुष्टि करते हैं कि आप व्यापार के साथ अपने हिस्से पर वास्तविक हैं।

विक्रेता के खिलाफ उचित कार्रवाई की गई है। किसी भी असुविधा के लिए हमें खेद है।

{{ cryptoAmount }} को *क्रेडिट* कर दिया गया है। अपने वॉलेट की जाँच करें।`,
      'dispute-resolved-seller-lose': `👩‍🎓  *विवाद सुलझ गया*

दोनों पक्षों द्वारा प्रस्तुत सबूत के आधार पर सावधानीपूर्वक समीक्षा के बाद, हम पुष्टि करते हैं कि इस व्यापार में आपकी ओर से गलती है।

नोट: बार-बार किए गए अपराध का परिणाम स्थायी प्रतिबंध होगा।`,
      'dispute-resolved-buyer-lose': `‍🎓  *विवाद सुलझ गया*

दोनों पक्षों द्वारा प्रस्तुत सबूत के आधार पर सावधानीपूर्वक समीक्षा के बाद, हम पुष्टि करते हैं कि इस व्यापार में आपकी ओर से गलती है।

नोट: बार-बार किए गए अपराध का परिणाम स्थायी प्रतिबंध होगा।`,
      'referral-comission': `🚀  *कमीशन प्राप्त हुआ*

बधाई हो! आपको अपने रेफरल व्यापार से {{ cryptoAmount }} कमीशन प्राप्त हुआ। कई और लोगों को आमंत्रित करते रहें।`,
      'open-dispute-cbbutton': '👩‍🎓 मुद्दा उठाएं',
      'dispute-initiator': `*ट्रेड् समर्थन* ${BotCommand.TRADE}{{ tradeId }}

इस ट्रेड् पर एक मुद्दा उठाया गया है। ट्रेड् अस्थायी रूप से अवरुद्ध है। इसे हल करने के लिए कृपया @{{ legalUsername }} संपर्क करें।`,
      'dispute-received': `*ट्रेड् समर्थन* ${BotCommand.TRADE}{{ tradeId }}

उपयोगकर्ता ने इस व्यापार पर एक मुद्दा उठाया है।

इसे हल करने के लिए कृपया @{{ legalUsername }} संपर्क करें।`,
      'confirm-payment-received': `*भुगतान की पुष्टि*

क्या आप वाकई खरीदार से *{{ fiatAmount }}* प्राप्त कर चुके हैं?`,
      'confirm-payment-received-yes-cbbutton': 'हाँ',
      'confirm-payment-received-no-cbbutton': 'नहीं',
      'payment-released-buyer': `🚀 *{{ cryptoCurrency }} जमा किया गया है* ${
        BotCommand.TRADE
      }{{ tradeId }}

आपके बटुए को इस व्यापार से * {{cryptoAmount}} * का श्रेय दिया जाता है।`,
      'payment-released-seller': `🚀 *सफल ट्रेड्* ${
        BotCommand.TRADE
      }{{ tradeId }}

{{{cryptoAmount}} * आपके वॉलेट से डेबिट किया और खरीदार को जारी किया।`,
      'give-rating': `🏅  *ट्रेड् को रेट करें*

इस ट्रेड् के लिए अपनी रेटिंग दें।`,
      'give-review': `🗣  *ट्रेड् की रिव्यू*

इस ट्रेड् के लिए एक छोटी रिव्यू लिखें`,
      'end-review': `रिव्यू जोड़ी गई।

🎉 अपने दोस्तों को आमंत्रित करें ताकि उन्हें भी सबसे अच्छा अनुभव हो, आप अपने ट्रेडों से फीस कमाने के लिए अपने रेफरल का उपयोग कर सकते हैं।

{{ referralLink }}`,
      'skip-review': 'स्किप ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*भुगतान की पुष्टि करें*

क्या आपने *{{ fiatAmount }}* विक्रेताओं को भेजा है *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'हाँ',
      'confirm-payment-sent-no-cbbutton': 'नहीं',
      'payment-sent-buyer': `*🛎 ट्रेड्* ${BotCommand.TRADE}{{ tradeId }}

विक्रेता को सूचित कर दिया गया है। विक्रेता द्वारा आपके भुगतान की पुष्टि के लिए कृपया प्रतीक्षा करें।

मामले में, कोई पुष्टि नहीं है; आप 'मुद्दा उठा सकते हैं'।`,
      'payment-sent-seller': `🛎  *भुगतान पूरा हुआ* ${
        BotCommand.TRADE
      }{{ tradeId }}

खरीदार ने आपके *{{ paymentMethod }}* पे *{{ fiatAmount }}* भेजा है। भुगतान प्राप्त होने पर कृपया पुष्टि करें।

यदि आपको भुगतान नहीं मिलता है, तो आप *मुद्दा उठा* सकते हैं।`,
      'escrow-warn-seller': `*जानकारी*

खरीदार को ट्रेड् के लिए भुगतान करना बाकी है। ${BotCommand.TRADE}{{ tradeId }}.

आप हमारे *सपॉर्ट* से संपर्क कर सकते हैं यदि आपको लगता है कि कुछ गलत है, तो वे आपकी सहायता करेंगे।

यदि *{{ paymentSendTimeout }} mins* में कोई पुष्टि प्राप्त नहीं होती है, तो अवरुद्ध राशि स्वचालित रूप से आपको जारी कर दी जाएगी।`,
      'escrow-warn-buyer': `*ट्रेड् भुगतान अनुस्मारक*

ट्रेड् के लिए भुगतान करना बाकी है ${
        BotCommand.TRADE
      }{{ tradeId }}. यदि आपने पहले ही भुगतान कर दिया है तो 'मैंने भुगतान किया है' पर क्लिक करें।

⚠️ आपके पास इस भुगतान को करने के लिए *{{ paymentSendTimeout }} mins* बचे हैं। उसके बाद किया गया कोई भी भुगतान अमान्य होगा।`,
      'escrow-closed-seller': `🤷‍♂️  *ट्रेड् बंद हो गया*

खरीदार ने भुगतान नहीं किया और ट्रेड् के लिए भुगतान की पुष्टि करें। ${
        BotCommand.TRADE
      }{{ tradeId }}.

आपका *{{ cryptoAmount }}* आपको वापस लौटा दिया गया है। इस ट्रेड् से संबंधित मुद्दों के लिए कृपया हमारे *सपॉर्ट* से संपर्क करें।`,
      'escrow-closed-buyer': `🤷‍♂️  *ट्रेड् बंद हो गया*

आपने विक्रेता को कोई भुगतान नहीं किया। ${
        BotCommand.TRADE
      }{{ tradeId }}. इस व्यापार से संबंधित मुद्दों के लिए, कृपया हमारे *सपॉर्ट* से संपर्क करें।`,
      'cancel-trade-confirm': `क्या आप वाकई ट्रेड् को रद्द करना चाहते हैं? ${
        BotCommand.TRADE
      }{{ tradeId }} *{{ fiatAmount }}* पर?

⚠️ यदि आपने विक्रेता को पहले ही भुगतान कर दिया है तो कभी भी रद्द न करें।`,
      'cancel-trade-confirm-yes-cbbutton': 'हाँ',
      'cancel-trade-confirm-no-cbbutton': 'नहीं',
      'cancel-trade-success': 'यह ट्रेड् आपके द्वारा रद्द कर दिया गया था।',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail':
        'ट्रेड् पहले ही रद्द कर दिया गया है या समाप्त हो गया है।',
      'cancel-trade-notify': `❗️ ट्रेड् ${
        BotCommand.TRADE
      }{{ tradeId }} उपयोगकर्ता द्वारा रद्द कर दिया गया था।`,
      'trade-rejected-notify':
        'उपयोगकर्ता ने इस व्यापार को रद्द कर दिया। आप BTC खरीदें / बेचें  के तहत अन्य अच्छे ट्रेड् चुन सकते हैं।',
      'trade-rejected-success': 'आपने इस व्यापार को अस्वीकार कर दिया।',
      'trade-accepted-seller-success': `🛎 *ट्रेड खोला है* ${
        BotCommand.TRADE
      }{{ tradeId }}

उपयोगकर्ता को आपके *{{ paymentMethodName }} में *{{ fiatPayAmount }}* जमा करने के लिए सूचित किया गया है।

[तेल्लेग्राम् पे संपर्क करें](tg://user?id={{ buyerUserId }})

जब यह भुगतान पूर्ण हो जाएगा, तो आपको सूचित किया जाएगा।`,
      'trade-accepted-buyer-no-payment-info':
        'भुगतान विवरण के लिए विक्रेता को संदेश भेजें।',
      'trade-accepted-buyer': `🛎  *ट्रेड् स्वीकार कर लिया* ${
        BotCommand.TRADE
      }{{ tradeId }}

{{ paymentMethodName }} के माध्यम से {{ fiatPayAmount }} का भुगतान करें, जब आपके भुगतान की पुष्टि हो जाएगी तो आपको *{{ cryptoAmount }}* प्राप्त होगा।

*{{ paymentMethodName }}*
राशि: *{{ fiatPayAmount }}*
भुगतान संदर्भ: *T{{ tradeId }}*
{{ paymentDetails }}

[तेल्लेग्राम् पे संपर्क करें](tg://user?id={{ buyerUserId }})

🔒 यह ट्रेड् सुरक्षित है। भुगतान केवल *{{ paymentSendTimeout }} mins* के लिए मान्य है।`,
      'payment-received-cbbutton': '💵  भुगतान प्राप्त',
      'payment-sent-cbbutton': '💸  मैंने भुगतान किया है',
      'trade-accepted-fail':
        '️माफ़ कीजिये। इस ट्रेड् को खोलने में एक त्रुटि हुई।',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ आपके पास इस आरडर पर पहले से मौजूद ट्रेड् है। आप एक ही क्रम के लिए कई ट्रेड नहीं रख सकते।',
        [TradeError.NOT_FOUND]: '❗️ हमें यह ट्रेड् नहीं मिला।',
        [TradeError.TRADE_EXPIRED]: '❗️ यह ट्रेड् अमान्य या समाप्त हो गया है।',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❗️ इस ट्रेड् को खोलने के लिए आपके पास खाते में अपर्याप्त शेष है।'
      },
      'init-get-confirm-buy': `🛎 *नया ट्रेड्* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} {{ fixedRate }}  पे *{{ fiatValue }}* के लिए *{{ cryptoCurrencyAmount }}* खरीदना चाहते हैं।

क्या आप इस ट्रेड् को स्वीकार करना चाहते हैं?`,
      'init-get-confirm-sell': `🛎 *नया ट्रेड्* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} *{{ fiatValue }}* के लिए *{{ fixedRate }}* *{{ cryptoCurrencyAmount }}* बेचना चाहता है।

क्या आप इस ट्रेड् को स्वीकार करना चाहते हैं?`,
      'trade-init-yes-cbbutton': 'हाँ',
      'trade-init-no-cbbutton': 'नहीं',
      'trade-init-no-response': `💤 *कोई जवाब नहीं*

यह उपयोगकर्ता ऑफ़लाइन है। कृपया अन्य ट्रेडों का प्रयास करें।`,
      'trade-init-expired': `⏳ *ट्रेड् समाप्त हो गया*

चूंकि आपने कोई जवाब नहीं दिया था, इसलिए ट्रेड् अनुरोध ${
        BotCommand.TRADE
      }{{ tradeId }} समाप्त हो गया है और रद्द कर दिया गया है।

यदि आप ऑफ़लाइन हैं तो आप अपना ऑर्डर आसानी से रोक सकते हैं। यह अन्य व्यापारियों के लिए एक अच्छा अनुभव सुनिश्चित करता है।`
    },
    'request-deposit-notify': `🛎  *नया खरीदने का अनुरोध*

आपके पास अपने आरडर पर एक नया खरीदने का अनुरोध है ${
      BotCommand.ORDER
    }{{ orderId }}.

*{{ requesterName }}* *{{ formattedFiatValue }}* के लिए *{{ formattedCryptoValue }}* खरीदना चाहते हैं।

[तेल्लेग्राम् पे संपर्क करें](tg://user?id={{ requesterUserId }})

⚠️ इस ट्रेड् को शुरू करने से पहले आपको आवश्यक BTC जमा करनी होगी।`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'आरडर नहीं मिला।',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'आप अपने आरडर पर सौदा नहीं खोल सकते हैं!',
      default: 'माफ़ कीजिये। एक त्रुटि हुई। बाद में पुन: प्रयास करें।'
    },
    'next-cbbutton': 'अगला',
    'prev-cbbutton': 'पिछला',
    'show-buy-deals': `📉 *BTC खरीदें* ({{ currentPage}}/{{ totalPages }})

कृपया उस ऑर्डर का चयन करें जिसे आप खरीदना चाहते हैं।

*मूल्य / {{ cryptoCurrencyCode }}*, *भुगतान का तरीका*, और *व्यापारी रेटिंग* दिखाई गई हैं।
`,
    'show-sell-deals': `📈 *BTC बेचें* ({{ currentPage}}/{{ totalPages }})

उस ऑर्डर को चुनें जिसे आप बेचना चाहते हैं।

*मूल्य / {{ cryptoCurrencyCode }}*, *भुगतान का तरीका*, और *क्रेता रेटिंग* दिखाए गई हैं।
`,
    'id-verified': 'सत्यापन: ✅ KYC सत्यापित',
    'show-buy-deal': `📉 *{{ cryptoCurrencyCode }} खरीदें* (${
      BotCommand.ORDER
    }{{ orderId }})

यह सौदा *{{ realName }}* द्वारा किया गया है।
{{ verificationText }}
खाता आइडी: ${BotCommand.ACCOUNT}{{ accountId }}
रेटिंग:  {{ rating }} ⭐️

*भुगतान विवरण*:
-----------------
भुगतान का तरीका: {{ paymentMethodName }}
शर्तें: _{{ terms }}_

*ट्रेड् विवरण*:
----------------
मूल्य: {{ rate }} / {{ cryptoCurrencyCode }}
राशि: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *{{ cryptoCurrencyCode }} बेचें* (${
      BotCommand.ORDER
    }{{ orderId }})

यह विक्रय आरडर *{{ realName }}* द्वारा है।
{{ verificationText }}
खाता आइडी: ${BotCommand.ACCOUNT}{{ accountId }}
रेटिंग:  {{ rating }} ⭐️

*भुगतान विवरण*:
-----------------
भुगतान का तरीका: {{ paymentMethodName }}
शर्तें: _{{ terms }}_

*ट्रेड् विवरण*:
----------------
मूल्य: {{ rate }} / {{ cryptoCurrencyCode }}
राशि: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `ट्रेड् शुरू करने के लिए उपयोगकर्ता के खाते पर अपर्याप्त खाता शेष। विक्रेता को जमा करने का अनुरोध करें जिसके बाद ट्रेड् शुरू हो सकता है।`,
    'request-buy-deal-deposit-cbbutton': '📲 विक्रेता से संपर्क करें',

    'open-buy-deal-cbbutton': '🛎 यहां से {{ cryptoCurrencyCode }} खरीदें',
    'open-sell-deal-cbbutton': '🛎 यहां से {{ cryptoCurrencyCode }} बेचें',
    'back-cbbutton': '⬅️ वापस',
    'user-reviews': '💬 रिव्यूस',
    'input-buy-amount': `💵  *खरीदने की राशि दर्ज करें*

{{ FiatCurrencyCode }} राशि *{{ minFiatValue }}* और *{{ maxFiatValue }}* के बीच दर्ज करें।

उदाहरण के लिए: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵  *विक्रय की राशि दर्ज करें*

{{ FiatCurrencyCode }} राशि *{{ minFiatValue }}* और *{{ maxFiatValue }}* के बीच दर्ज करें।

उदाहरण के लिए: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*भुगतान विवरण*

खरीदार को आपको पैसे भेजने के लिए *{{ paymentMethodType }}* नया भुगतान विवरण चुनें या जोड़ें।`,
    'skip-input-payment-details': 'छोड़ें',
    'add-payment-details': '➕ जोड़ें {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*इस ट्रेड को खोलें?*

क्या आप *{{ cryptoValue }}*  को *{{ fiatValue }}* {{ rate }} दर पर खरीदना चाहते हैं?

❕ *'हां'* पर क्लिक करने पर, आप ट्रेड की शर्तों से सहमत होते हैं।`,

    'confirm-input-sell-amount': `*इस ट्रेड को खोलें?*

क्या आप सुनिश्चित हैं कि आप *{{ cryptoValue }}* को *{{ fiatValue }}* * कीमत पर * {{ rate }} * बेचना चाहते हैं?

❕ *'हां'* पर क्लिक करने पर, आप ट्रेड की शर्तों से सहमत होते हैं।`,
    'confirm-input-amount-yes-cbbutton': 'हाँ',
    'confirm-input-amount-no-cbbutton': 'नहीं',
    'show-open-deal-request': `📲 *निमंत्रण भेजा गया!*

आपका अनुरोध भेज दिया गया है, यह सौदा विक्रेता द्वारा आवश्यक BTC जमा करने के बाद ही शुरू होगा।

⚠️ महत्वपूर्ण: यहां जमा की पुष्टि होने से पहले कभी भी कोई भुगतान न करें। MegaDeals के बाहर कोई सौदा न करें, आप अपना पैसा खोने का जोखिम उठाते हैं।

*टेलीग्राम पर विक्रेता से संपर्क करें*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'डील रद्द',
    'trade-opened-message': 'ट्रेड अब सक्रिय है!',
    'show-opened-trade': `*ट्रेड* ${BotCommand.TRADE}{{ tradeId }}

${
      BotCommand.ACCOUNT
    }{{ traderAccountId }} के लिए इंतजार... यदि उपयोगकर्ता {{ timeoutMinutes }} मिनट के भीतर ट्रेड की शुरुआत की पुष्टि नहीं करता है, तो ट्रेड स्वचालित रूप से रद्द हो जाएगा।

⚠️ महत्वपूर्ण: सुरक्षा कारणों से, मेगाडईल्स के बाहर कोई ट्रेड न करें।

यदि आपने पहले ही भुगतान कर दिया है तो ट्रेड रद्द न करें।

*Auto cancel in {{ timeoutMinutes }} minutes*`,
    'cancel-trade-cbbutton': '🚫 ट्रेड रद्द करें'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'बेचने का आरडर @ {{ rate }}',
    'my-buy-order-cbbutton': 'खरीदने का आरडर @ {{ rate }}',
    'buy-deal-cbbutton': '🛎  BTC बेचने का ट्रेड - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎  खरीदने का ट्रेड - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 जमा {{ cryptoCurrencyCode }}',
    'show-active-orders': `*सक्रिय आरडर*

आपके द्वारा चलाए गए ट्रेड और आरडर यहां दिखाए गए हैं।
`,
    'order-enabled': 'आपका आरडर अब सक्रिय है।',
    'input-payment-details-field': `अपने *{{ fieldName }}* के लिए *{{ paymentMethod }}* लिखें`,
    'order-disabled': `आपका आरडर निष्क्रिय है। इस आरडर को सक्षम करने के लिए *'सक्रिय'* बटन पर क्लिक करें।`,
    'show-orders': 'TODO: मेरे आरडर दिखाओ',

    'terms-not-added': '--',
    'my-buy-order-info': `📗  *खरीदने का आरडर* - ${BotCommand.ORDER}{{orderId}}

*स्टेटस*: {{ status }}
*{{ cryptoCurrencyCode }} मूल्य*: {{ rate }}
*न्यूनतम राशि*: {{ minAmount }}
*अधिकतम राशि*: {{ maxAmount }}
*भुगतान की जानकारी*: {{ paymentMethod }}

शर्तें: _{{ terms }}_

*आरडर लिंक*: {{ orderLink }}
इस लिंक को शेयर करें और अन्य उपयोगकर्ताओं के साथ सीधे एक सौदा खोलें।
`,
    'payment-info-not-added': 'नहीं जोड़ा गया',
    'insufficient-sell-order-balance':
      '⚠️ अपर्याप्त खाता शेष। इस आरडर पर ट्रेड् शुरू करने के लिए न्यूनतम राशि जमा करें.',
    'my-sell-order-info': `*📕 बेचने का आरडर* - ${BotCommand.ORDER}{{orderId}}

*स्टेटस*: {{ status }}
*{{cryptoCurrencyCode}} मूल्य*: {{ rate }}
*न्यूनतम राशि*: {{ minAmount }}
*अधिकतम राशि*: {{ maxAmount }}
*भुगतान का तरीका*: {{ paymentMethod }}
*भुगतान की जानकारी*: {{ paymentInfo }}

शर्तें: _"{{ terms }}"_

*आरडर लिंक*: {{ orderLink }}
इस लिंक को शेयर करें और अन्य उपयोगकर्ताओं के साथ सीधे एक सौदा खोलें।
`,
    'edit-amount-cbbutton': '⚖️ राशि',
    'edit-rate-cbbutton': '💸 BTC मूल्य बदलें',
    'edit-terms-cbbutton': '📝 शर्तें',
    'edit-payment-method-cbbutton': '💳 Payment method',
    'toggle-active-cbbutton': 'सक्रिय',
    'delete-order-cbbutton': '🗑️ आरडर हटाएं!',
    'edit-order': '✏️ आरडर संपादित करें',
    'go-back-cbbutton': '⬅️ वापस',
    'order-edit-success': '✅ आपका आरडर बदल दिया गया है',
    'edit-payment-details': '📃 भुगतान जानकारी अपडेट करें',
    'order-edit-rate': `*{{ CryptoCurrencyCode }} मूल्य सेट करें*

{{ CryptoCurrencyCode }} के लिए *{{ fiatCurrencyCode }}* में निर्धारित मूल्य दर्ज करें या मार्जिन मूल्य निर्धारित करने के लिए प्रतिशत (%) में दर्ज करें।

उदाहरण: *{{ marketRate }}* or *2%*`,
    'order-edit-terms': `📋 *शर्तें*

व्यापार के लिए अपनी शर्तें लिखें। यह आपके आरडर पर दिखाया जाएगा।`,
    'order-delete-success': 'आदेश हटा दिया गया'
  },

  'create-order': {
    show: `📝 *आरडर बनाएँ*

आरडर  के प्रकार का चयन करें।`,
    'new-buy-order-cbbutton': '📗  मैं BTC खरीदना चाहता हूं',
    'new-sell-order-cbbutton': '📕  मैं BTC बेचना चाहता हूं',
    'input-fixed-rate': `*💸 {{CryptoCurrencyCode}} मूल्य सेट करें*

{{ CryptoCurrencyCode }} के लिए *{{ fiatCurrencyCode }}* में एक निश्चित मूल्य दर्ज करें या मार्जिन मूल्य निर्धारित करने के लिए प्रतिशत (%) में दर्ज करें।

उदाहरण: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 {{CryptoCurrencyCode}} मूल्य सेट करें*

बाजार दरों के आधार पर एक मूल्य निर्धारित करने के लिए मार्जिन मूल्य का उपयोग करें। वर्तमान बाजार दर से ऊपर या नीचे बेचने के लिए + / - प्रतिशत (%) का उपयोग करें।

वर्तमान बाजार दर: {{ marketRate }} ({{ marketRateSource }})

उदाहरण: 3% or -2%`,
    'use-margin-price-cbbutton': 'ℹ️ मार्जिन मूल्य निर्धारण के बारे में',
    'use-fixed-price-cbbutton': '⬅️ मूल्य',
    'back-cbbutton': '⬅️ वापस',
    'input-amount-limits': `⚖️ *आरडर राशि*

* {{FiatCurrencyCode}} * में आरडर राशि दर्ज करें।

उदाहरण: या तो 1000 या 500-1000 (न्यूनतम-अधिकतम सीमा)`,
    'buy-order-created': '✅  BTC खरीदने के लिए आरडर बनाया गया है।',
    'sell-order-created': '✅  BTC बेचने के लिए आरडर बनाया गया है।',
    'create-error': '❗️  यह आरडर नहीं बन। बाद में पुन: प्रयास करें।',
    'select-payment-method': `💳  *भुगतान का तरीका*

Select a payment method.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'और दिखाओ »'
  },

  'active-orders': {}
}
