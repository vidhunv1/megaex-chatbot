import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeAR = {
  home: {
    exchange: `💵  *تبادل BTC-{{ fiatCurrency }}*

✅  دعم 24/7 عبر {{supportBotUsername}}
🔒  يتم تأمين جميع الصفقات مع ضمان الضمان.

سعر السوق: ({{ exchangeSourceName }}) {{ formattedMarketRate }}`,

    'my-orders-cbbutton': 'بلدي نشط ({{ orderCount }})',
    'create-order-cbbutton': '📊 إنشاء النظام',
    'buy-cbbutton': '📉 شراء سريع',
    'sell-cbbutton': '📈 بيع سريع'
  },

  deals: {
    'no-quick-sell': `📉  *شراء سريع*

لا توجد أوامر شراء نشطة. إنشاء طلب شراء جديد.`,
    'new-quick-sell-cbbutton': '📗 طلب شراء جديد',
    'no-quick-buy': `📉  *بيع سريع*

لا توجد أوامر بيع نشطة. إنشاء أمر بيع جديد.`,
    'new-quick-buy-cbbutton': '📕 طلب بيع جديد',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *حل النزاع*

بعد المراجعة الدقيقة بناءً على الدليل المقدم من كلا الطرفين ، نؤكد أنك حقيقي من جانبك في التجارة.

تم اتخاذ الإجراءات المناسبة ضد المشتري. نحن نعتذر عن أي إزعاج قد يسببه.

تم الافراج عن الصناديق المغلقة *. تحقق محفظتك.`,
      'dispute-resolved-buyer-win': `👩‍🎓  *حل النزاع*

بعد المراجعة الدقيقة بناءً على الدليل المقدم من كلا الطرفين ، نؤكد أنك حقيقي من جانبك في التجارة.

تم اتخاذ الإجراءات المناسبة ضد البائع. نحن نعتذر عن أي إزعاج قد يسببه.

{{cryptoAmount}} تم اعتماده *. تحقق محفظتك.`,
      'dispute-resolved-seller-lose': `👩‍🎓  *حل النزاع*

بعد المراجعة الدقيقة بناءً على الدليل المقدم من كلا الطرفين ، نؤكد وجود خطأ من جانبك في تجارة thsi

ملاحظة: سوف تؤدي الجريمة المتكررة إلى فرض حظر دائم.`,
      'dispute-resolved-buyer-lose': `‍🎓  *حل النزاع*

بعد المراجعة الدقيقة بناءً على الدليل المقدم من كلا الطرفين ، نؤكد وجود خطأ من جانبك في هذه التجارة.

ملاحظة: سوف تؤدي الجريمة المتكررة إلى فرض حظر دائم.`,
      'referral-comission': `🚀  *تلقى عمولة*

تهانينا! لقد استلمت {{cryptoAmount}} عمولة من تجارة الإحالات الخاصة بك. الحفاظ على دعوة.`,
      'open-dispute-cbbutton': '👩‍🎓 افتح العدد',
      'dispute-initiator': `*دعم التجارة* ${BotCommand.TRADE}{{ tradeId }}

لقد أثيرت مشكلة في هذه التجارة. تم حظر التجارة مؤقتًا. يرجى الاتصال @{{legalUsername}} لحل هذه المشكلة.`,
      'dispute-received': `*دعم التجارة* ${BotCommand.TRADE}{{ tradeId }}

أثار المستخدم مشكلة في هذه التجارة.

يرجى الاتصال @ {{legalUsername}} لحل هذه المشكلة.`,
      'confirm-payment-received': `*تأكيد الدفعة*

هل أنت متأكد من أنك قد استلمت * {{fiatAmount}} * من المشتري؟`,
      'confirm-payment-received-yes-cbbutton': 'نعم فعلا',
      'confirm-payment-received-no-cbbutton': 'لا',
      'payment-released-buyer': `🚀 * {{ cryptoCurrency }} الفضل* ${
        BotCommand.TRADE
      }{{ tradeId }}

تتم إضافة محفظتك إلى * {{cryptoAmount}} * من هذه التجارة.`,
      'payment-released-seller': `🚀 *تجارة ناجحة* ${
        BotCommand.TRADE
      }{{ tradeId }}

* {{cryptoAmount}} * مدين من محفظتك وأُطلق على المشتري.`,
      'give-rating': `🏅  *قيم هذه التجارة*

إعطاء تقييمك لهذه التجارة.`,
      'give-review': `🗣  *مراجعة التجارة*

اكتب مراجعة قصيرة لهذه التجارة`,
      'end-review': `تمت إضافة المراجعة.

🎉 قم بدعوة أصدقائك حتى يتمكنوا من الحصول على أفضل تجربة ، ويمكنك استخدام الإحالة لكسب الرسوم من صفقاتهم.

{{ referralLink }}`,
      'skip-review': 'تخطى ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*تأكيد الدفع*

هل أرسلت * {{fiatAmount}} * إلى البائعين * {{paymentMethodType}} *؟`,
      'confirm-payment-sent-yes-cbbutton': 'نعم فعلا',
      'confirm-payment-sent-no-cbbutton': 'لا',
      'payment-sent-buyer': `*🛎 تجارة* ${BotCommand.TRADE}{{ tradeId }}

تم إخطار البائع. يرجى الانتظار حتى يؤكد البائع دفعتك.

في حالة عدم وجود تأكيد ؛ يمكنك "رفع القضية".`,
      'payment-sent-seller': `🛎  *تم تأكيد عملية الدفع* ${
        BotCommand.TRADE
      }{{ tradeId }}

أرسل المشتري * {{fiatAmount}} * إلى * {{paymentMethod}} *. يرجى تأكيد عندما تتلقى الدفع.

في حالة عدم استلام المبلغ ، يمكنك رفع العدد *.`,
      'escrow-warn-seller': `*معلومات*

المشتري لم تسدد قيمة الصفقة بعد. ${BotCommand.TRADE}{{ tradeId }}.

يمكنك الاتصال بدعم * لدينا * إذا كنت تعتقد أن هناك خطأ ما ، فسوف يساعدونك.

إذا لم يتم استلام أي تأكيد خلال * {{paymentSendTimeout}} دقيقة * ، فسيتم إصدار المبلغ المحظور تلقائيًا إليك.`,
      'escrow-warn-buyer': `*تذكير بالدفع التجاري*

أنت لم تسدد المبلغ بعد مقابل الصفقة ${
        BotCommand.TRADE
      }{{ tradeId }}. انقر فوق "لقد دفعت" إذا كنت قد قمت بالفعل بالدفع.

⚠️ لقد تركت {{paymentSendTimeout}} دقيقة * لإجراء هذا الدفع. أي دفعة يتم إجراؤها بعد ذلك ستكون غير صالحة.`,
      'escrow-closed-seller': `🤷‍♂️  *التجارة مغلقة*

المشتري لم يدفع ويؤكد الدفع للتجارة. ${BotCommand.TRADE}{{ tradeId }}.

تمت إعادة * {{cryptoAmount}} * إليك. للمشاكل المتعلقة بهذه التجارة ، يرجى الاتصال على * support *.`,
      'escrow-closed-buyer': `🤷‍♂️  *التجارة مغلقة*

لم تقم بإجراء أي مدفوعات إلى البائع مقابل الصفقة. ${
        BotCommand.TRADE
      }{{ tradeId }}. للمشاكل المتعلقة بهذه التجارة ، يرجى الاتصال * دعم *.`,
      'cancel-trade-confirm': `هل أنت متأكد من رغبتك في إلغاء ${
        BotCommand.TRADE
      }{{ tradeId }} التجاري على *{{ fiatAmount }}*

⚠️ لا تلغي أبدًا إذا كنت قد دفعت البائع بالفعل.`,
      'cancel-trade-confirm-yes-cbbutton': 'نعم فعلا',
      'cancel-trade-confirm-no-cbbutton': 'لا',
      'cancel-trade-success': 'تم إلغاء هذه الصفقة بواسطتك.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'تم إلغاء الصفقة بالفعل أو انتهت صلاحيتها.',
      'cancel-trade-notify': `❗️تم إلغاء ${
        BotCommand.TRADE
      }{{ tradeId }} للتجارة من قبل المستخدم.`,
      'trade-rejected-notify':
        'ألغى المستخدم هذه التجارة. يمكنك اختيار صفقات جيدة أخرى تحت شراء / بيع سريع.',
      'trade-rejected-success': 'لقد رفضت هذه التجارة.',
      'trade-accepted-seller-success': `🛎 *التجارة المفتوحة* ${
        BotCommand.TRADE
      }{{ tradeId }}

تم إعلام المستخدم بإيداع * {{fiatPayAmount}} * في * {{paymentMethodName}} *.

[Telegram contact](tg://user?id={{ buyerUserId }})

سيتم إعلامك عند وضع علامة على هذه الدفعة على أنها مكتملة.`,
      'trade-accepted-buyer-no-payment-info':
        'إرسال رسالة إلى البائع للحصول على تفاصيل الدفع.',
      'trade-accepted-buyer': `🛎  *التجارة المقبولة* ${
        BotCommand.TRADE
      }{{ tradeId }}

يمكنك إجراء دفعة {{fiatPayAmount}} من خلال {{paymentMethodName}} ، ستتلقى * {{cryptoAmount}} * عند تأكيد الدفع الخاص بك.

*{{ paymentMethodName }}*
كمية: *{{ fiatPayAmount }}*
إشارة دفع: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram contact](tg://user?id={{ buyerUserId }})

🔒 هذه التجارة مؤمنة. الدفع صالح فقط لمدة * {{paymentSendTimeout}} دقيقة *.`,
      'payment-received-cbbutton': '💵  تلقى الدفع',
      'payment-sent-cbbutton': '💸  لقد دفعت',
      'trade-accepted-fail': '️آسف. كان هناك خطأ في فتح هذه التجارة.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ لديك بالفعل صفقة حالية على هذا الطلب. لا يمكنك وضع عمليات متعددة لنفس الترتيب.',
        [TradeError.NOT_FOUND]: '❗️ لم نتمكن من العثور على هذه التجارة.',
        [TradeError.TRADE_EXPIRED]:
          '❗️ هذه الصفقة غير صالحة أو منتهية الصلاحية.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❗️ ليس لديك رصيد كاف لفتح هذه التجارة'
      },
      'init-get-confirm-buy': `🛎 *تجارة جديدة* ${BotCommand.TRADE}{{ tradeId }}

يريد ${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} شراء *{{ cryptoCurrencyAmount }}* مقابل *{{ fiatValue }}* بسعر {{ fixedRate }}.

هل تريد قبول هذه التجارة؟`,
      'init-get-confirm-sell': `🛎 *تجارة جديدة* ${BotCommand.TRADE}{{ tradeId }}

يريد ${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} بيع *{{ cryptoCurrencyAmount }}* مقابل *{{ fiatValue }}* بسعر {{ fixedRate }}

هل تريد قبول هذه التجارة؟`,
      'trade-init-yes-cbbutton': 'نعم فعلا',
      'trade-init-no-cbbutton': 'لا',
      'trade-init-no-response': `💤 *لا يوجد رد*

هذا المستخدم موجود حاليًا. يرجى محاولة الصفقات الأخرى.`,
      'trade-init-expired': `⏳ *انتهت صلاحية التجارة*

نظرًا لأنك لم تستجب ، فقد انتهى الطلب التجاري ${
        BotCommand.TRADE
      }{{ tradeId }} وألغى.

يمكنك إيقاف طلبك بسهولة إذا كنت بعيدًا. هذا يضمن تجربة جيدة للمتداولين الآخرين.`
    },
    'request-deposit-notify': `🛎  *طلب شراء جديد*

لديك طلب شراء جديد على ${BotCommand.ORDER}{{ orderId }} طلبك.

يريد *{{ requesterName }}* شراء *{{ formattedCryptoValue }}* مقابل *{{ formattedFiatValue }}*.

[Telegram contact](tg://user?id={{ requesterUserId }})

⚠️ تحتاج إلى إيداع الأموال المطلوبة قبل أن تتمكن من بدء هذه الصفقة.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'لم يتم العثور على الطلب.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]: 'لا يمكنك فتح الصفقة بناء على طلبك!',
      default: 'آسف. حدث خطأ. الرجاء معاودة المحاولة في وقت لاحق.'
    },
    'next-cbbutton': 'التالى',
    'prev-cbbutton': 'سابق',
    'show-buy-deals': `📉 *شراء سريع* ({{ currentPage}}/{{ totalPages }})

يرجى تحديد الترتيب الذي تريد الشراء منه.

يتم عرض السعر / {{cryptoCurrencyCode}} وطريقة الدفع وتقييم المتداول.
`,
    'show-sell-deals': `📈 *بيع سريع* ({{ currentPage}}/{{ totalPages }})

حدد الترتيب الذي تريد البيع به.

يتم عرض السعر / {{cryptoCurrencyCode}} وطريقة الدفع وتقييم المشتري.
`,
    'id-verified': 'التحقق: ✅ معرف التحقق',
    'show-buy-deal': `📉 *يشترى {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

هذه الصفقة بواسطة * {{realName}} *.
{{ verificationText }}
معرف الحساب: ${BotCommand.ACCOUNT}{{ accountId }}
تقييم:  {{ rating }} ⭐️

*بيانات الدفع*:
-----------------
طريقة الدفع او السداد: {{ paymentMethodName }}
شروط: _{{ terms }}_

*تفاصيل التجارة*:
----------------
السعر: {{ rate }} / {{ cryptoCurrencyCode }}
شراء المبلغ: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *يبيع {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

ترتيب البيع هذا بواسطة * {{realName}} *.
{{ verificationText }}
معرف الحساب: ${BotCommand.ACCOUNT}{{ accountId }}
تقييم:  {{ rating }} ⭐️

*بيانات الدفع*:
-----------------
طريقة الدفع او السداد: {{ paymentMethodName }}
شروط: _{{ terms }}_

*تفاصيل التجارة*:
----------------
السعر: {{ rate }} / {{ cryptoCurrencyCode }}
بيع المبلغ: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `أموال غير كافية على حساب المتداولين لبدء الصفقة. اطلب من البائع إيداع الأموال التي يمكن بعدها بدء الصفقة.`,
    'request-buy-deal-deposit-cbbutton': '📲 تواصل مع البائع',

    'open-buy-deal-cbbutton': '🛎 اشتر {{cryptoCurrencyCode}} من هنا',
    'open-sell-deal-cbbutton': '🛎 بيع {{cryptoCurrencyCode}} من هنا',
    'back-cbbutton': '⬅️ الى الخلف',
    'user-reviews': '💬 مراجعات المستخدم',
    'input-buy-amount': `💵  *أدخل مبلغ الشراء*

أدخل {{fiatCurrencyCode}} المبلغ بين * {{minFiatValue}} * و * {{maxFiatValue}} *.

على سبيل المثال: 1000 {{fiatCurrencyCode}}.`,
    'input-sell-amount': `💵  *أدخل كمية البيع*

أدخل {{fiatCurrencyCode}} المبلغ بين * {{minFiatValue}} * و * {{maxFiatValue}} *.

على سبيل المثال: 1000 {{fiatCurrencyCode}}.`,
    'input-payment-details': `*بيانات الدفع*

حدد أو أضف تفاصيل دفع جديدة لـ * {{paymentMethodType}} * للمشتري لكي يرسل لك المال.`,
    'skip-input-payment-details': 'تخطى',
    'add-payment-details': '➕ أضف {{paymentMethodName}}',
    'confirm-input-buy-amount': `*افتح هذه التجارة؟*

هل أنت متأكد من رغبتك في شراء * {{cryptoValue}} * لـ * {{fiatValue}} * بالسعر {{rate}}؟

❕ عند النقر فوق "نعم" * ، فإنك توافق على شروط التجارة.`,

    'confirm-input-sell-amount': `*افتح هذه التجارة؟*

هل أنت متأكد من رغبتك في بيع * {{cryptoValue}} * لـ * {{fiatValue}} * بالسعر * {{rate}} *؟

❕ عند النقر فوق "نعم" * ، فإنك توافق على شروط التجارة.`,
    'confirm-input-amount-yes-cbbutton': 'نعم فعلا',
    'confirm-input-amount-no-cbbutton': 'لا',
    'show-open-deal-request': `📲 *تم ارسال الطلب!*

تم إرسال طلبك ، ولن تبدأ هذه الصفقة إلا بعد قيام البائع بإيداع الأموال المطلوبة.

: هام: لا تقم بأي دفع قبل تأكيد الإيداع هنا. لا تجعل أي صفقات خارج MegaDeals ، فإنك تخاطر بخسارة أموالك.

*البائع برقية الاتصال*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'تم إلغاء الصفقة.',
    'trade-opened-message': 'التجارة نشطة الآن!',
    'show-opened-trade': `*تجارة.* ${BotCommand.TRADE}{{ tradeId }}

في انتظار vidhunas ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. إذا لم يؤكد المستخدم بدء التداول خلال {{timeoutMinutes}} دقيقة ، فسيتم إلغاء الصفقة تلقائيًا.

⚠️ هام: لأسباب أمنية ، لا تقم بإجراء أي صفقات خارج MegaDeals.

لا تلغي المعاملة أبدًا إذا كنت قد قمت بالفعل بالدفع.

* الإلغاء التلقائي في {{timeoutMinutes}} دقيقة *`,
    'cancel-trade-cbbutton': '🚫 إلغاء التجارة'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'ترتيب بيع @ {{ rate }}',
    'my-buy-order-cbbutton': '{{ rate }} @ Buy order',
    'buy-deal-cbbutton': '🛎 شراء التجارة - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎 بيع التجارة - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 الوديعة {{ cryptoCurrencyCode }}',
    'show-active-orders': `*أوامر نشطة*

يتم سرد التداولات والطلبات المستمرة التي أنشأتها أنت.
`,
    'order-enabled': 'طلبك نشط الآن.',
    'input-payment-details-field': `اكتب * {{fieldName}} * لـ * {{paymentMethod}} *`,
    'order-disabled': `تم تعيين طلبك على أنه غير نشط.
انقر على زر * "نشط" * لتمكين هذا الطلب.`,
    'show-orders': 'تودو: إظهار أوامري',

    'terms-not-added': 'لا شيء',
    'my-buy-order-info': `📗  *طلب الشراء الخاص بي* - ${
      BotCommand.ORDER
    }{{orderId}}

*الحالة*: {{ status }}
*{{ cryptoCurrencyCode }} السعر*: {{ rate }}
*دقيقة. كمية*: {{ minAmount }}
*ماكس. كمية*: {{ maxAmount }}
*طريقة الدفع او السداد*: {{ paymentMethod }}

شروط: _{{ terms }}_

*رابط الطلب*: {{ orderLink }}
مشاركة هذا الرابط. يمكن لأي شخص ينقر على هذا الرابط فتح تجارة معك.
`,
    'payment-info-not-added': 'غير مضافة',
    'insufficient-sell-order-balance':
      '⚠️ عدم كفاية الرصيد. قم بإيداع الحد الأدنى للمبلغ لبدء الصفقات على هذا الطلب.',
    'my-sell-order-info': `*📕 طلب البيع الخاص بي* - ${
      BotCommand.ORDER
    }{{orderId}}

*الحالة*: {{ status }}
*{{ cryptoCurrencyCode }} السعر*: {{ rate }}
*دقيقة. كمية*: {{ minAmount }}
*ماكس. كمية*: {{ maxAmount }}
*طريقة الدفع او السداد*: {{ paymentMethod }}
*معلومات الدفع*: {{ paymentInfo }}

شروط: _"{{ terms }}"_

*رابط الطلب*: {{ orderLink }}
شارك هذا الرابط وافتح صفقة مباشرة مع متداولين آخرين.
`,
    'edit-amount-cbbutton': '⚖️ كمية',
    'edit-rate-cbbutton': '💸 سعر BTC',
    'edit-terms-cbbutton': '📝 شروط',
    'edit-payment-method-cbbutton': '💳 طريقة الدفع او السداد',
    'toggle-active-cbbutton': 'نشيط',
    'delete-order-cbbutton': '🗑️ حذف!',
    'edit-order': '✏️ تحرير الطلب',
    'go-back-cbbutton': '⬅️ الى الخلف',
    'order-edit-success': '✅ تم تحديث طلبك.',
    'edit-payment-details': '📃 تحديث معلومات الدفع',
    'order-edit-rate': `ضبط سعر *{{ cryptoCurrencyCode }}*

أدخل السعر الثابت {{cryptoCurrencyCode}} في * {{fiatCurrencyCode}} * أو أدخل النسبة المئوية (٪) لتعيين سعر الهامش.

مثال: * {{marketRate}} * أو * 2٪ *`,
    'order-edit-terms': `📋 *شروط*

اكتب الشروط الخاصة بك للتجارة. سيظهر هذا على طلبك.`,
    'order-delete-success': 'تم حذف الطلب'
  },

  'create-order': {
    show: `📝 *إنشاء النظام*

اختر نوع الطلب`,
    'new-buy-order-cbbutton': '📗  أريد شراء',
    'new-sell-order-cbbutton': '📕  أريد أن أبيع',
    'input-fixed-rate': `*💸 عيّن سعر {{cryptoCurrencyCode}}*

أدخل سعرًا ثابتًا لـ {{cryptoCurrencyCode}} في * {{fiatCurrencyCode}} * أو أدخل نسبة مئوية (٪) لتعيين سعر الهامش.

مثال: * {{marketRate}} * أو * 2٪*`,
    'input-margin-rate': `*💸 تحديد سعر {{cryptoCurrencyCode}} *

استخدم سعر الهامش لتعيين سعر ديناميكي على أساس أسعار السوق. استخدم + / - النسبة المئوية (٪) للبيع أعلى أو أقل من سعر السوق الحالي.

سعر السوق الحالي: {{ marketRate }} ({{ marketRateSource }})

مثال: 3% or -2%`,
    'use-margin-price-cbbutton': 'ℹ️ تسعير الهامش',
    'use-fixed-price-cbbutton': '⬅️ السعر',
    'back-cbbutton': '⬅️ الى الخلف',
    'input-amount-limits': `⚖️ *كمية الطلب*

أدخل مبلغ الطلب في * {{fiatCurrencyCode}} *.

مثال: إما 1000 أو 500-1000 (الحد الأدنى والحد الأقصى)`,
    'buy-order-created': '✅  تم إنشاء طلب الشراء الخاص بك.',
    'sell-order-created': '✅  تم إنشاء طلب البيع الخاص بك.',
    'create-error':
      '❗️  لا يمكن إنشاء هذا الطلب. الرجاء معاودة المحاولة في وقت لاحق.',
    'select-payment-method': `💳  *طريقة الدفع او السداد*

اختر طريقة الدفع.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'أظهر المزيد »'
  },

  'active-orders': {}
}
