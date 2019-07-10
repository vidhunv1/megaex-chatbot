import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountAR = {
  home: {
    'passport-data-received': `✅ *الهوية المستلمة*

تم استلام مستندات التحقق الخاصة بك. يجب معالجة هذا في 3 ساعات عمل. سنبلغك عندما تتم معالجتها.`,
    'trade-message': `عرض التجارة ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 اكتب رسالة',
    'send-response-cbbutton': '📝 اكتب الرد',
    'message-sent': 'تم الارسال!',
    'new-photo-message': `📨 ${
      BotCommand.ACCOUNT
    }{{ accountId }} <b>رسالة من</b>
{{ tradeInfo }}
تلقى الصورة`,
    'message-not-sent': '❗️ فشل فى الارسال.',
    'enter-message': 'أدخل الرسالة للمستخدم. (بحد أقصى 400 حرف)',
    'new-message': `📨 ${BotCommand.ACCOUNT}{{ accountId }} رسالة من

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ الى الخلف',
    'more-cbbutton': '» more',
    'no-reviews-available': 'لا توجد تعليقات حتى الآن.',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *مراجعة ل* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

بواسطة *{{ reviewerName }}*. المتداولة لمدة {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'لا يمكن العثور على هذا الحساب.'
    },
    account: `👤  *حسابي*

معرف الحساب: ${BotCommand.ACCOUNT}{{ accountID }}

💵 إجمالي العروض: {{ dealCount }}
💎 حجم: {{ tradeVolume }}
⭐ التقييم: {{ rating }}

🤝 الإحالات المدعوة: {{ referralCount }} المستخدمين
💰 أرباح الإحالة: {{ earnings }}

{{ paymentMethods }} :💳 *طرق الدفع*`,

    'dealer-account': `(${BotCommand.ACCOUNT}{{ accountId }}) *تفاصيل الحساب* 

[Telegram contact](tg://user?id={{ telegramUserId }})

{{ dealCount }} :💵 الصفقات التجارية
{{ tradeVolume }} {{ cryptoCurrencyCode }} :💎 حجم التجارة
{{ rating }} :⭐ التقييم`,

    'user-reviews-cbbutton': '🗣 ({{ reviewCount }}) التعليقات',
    'block-dealer-cbbutton': '⛔️ مستخدم محضور',
    'unblock-dealer-cbbutton': 'إلغاء حظر عن مستخدم',
    'verify-account-cbbutton': '🆔 تحقق من الهوية',
    'manage-payment-methods-cbbutton': '💳 طرق الدفع',
    'referral-link-cbbutton': '🤝 إحالة',
    'settings-cbbutton': '️⚙️ الإعدادات',
    'no-payment-method': `لا شيء`
  },

  'payment-method': {
    'does-not-exist': `❗️  *طريقة الدفع غير صالحة*

طريقة الدفع هذه غير موجودة.

يمكنك طلب @{{supportBotUsername}} للحصول على طريقة دفع صالحة المضافة.`,

    'create-error':
      'آسف. لم نتمكن من إنشاء طريقة الدفع هذه. الرجاء معاودة المحاولة في وقت لاحق.',
    'edit-cbbutton': '🖋  تحرير طرق الدفع',
    'add-cbbutton': '➕  إضافة طريقة دفع',
    'show-all': `💳 *طرق الدفع*

{{ paymentMethodsList }}`,
    'show-edit': `*تحرير طريقة الدفع*

انقر فوق طريقة الدفع التي تريد تحريرها.`,
    'select-to-add': `*تحديد*

حدد طريقة الدفع الخاصة بك لإضافتها من الخيارات أدناه.`,
    'edit-enter-field': 'أدخل *{{fieldName}}*',
    created: `✅ طريقة الدفع *المضافة*

تتم إضافة طريقة الدفع الخاصة بك.

{{ paymentMethodInfo }}
يمكنك الآن استخدام هذا لتلقي الأموال عند بيع {{ cryptoCurrencyCode }}.`,
    updated: `✅ *طريقة الدفع المحدثة*

تم تحديث طريقة الدفع الخاصة بك.

{{ paymentMethodInfo }}`,
    'none-added': `لم تتم إضافة طرق دفع. يتم استخدامها لتحويل الأموال إليك عند البيع.`
  },

  referral: {
    'show-info': `🤝  *الرجوع وكسب*

عدد الإحالات الخاص بك: {{referralCount}} المستخدمين
رسوم الإحالة: {{referralFeesPercentage}}%

اربح عملات bitcoins مع كل عملية تداول تقوم بها إحالتك. ستحصل على {{referralFeesPercentage}}٪ من رسوم التجارة.

على سبيل المثال: إذا تم تداول إحالتك 1 BTC ، فستجني 0.004 BTC من 0.008 BTC التي نأخذها كرسوم.

معالجتها والائتمان على الفور إلى محفظتك. لا قيود ولا تاريخ انتهاء الصلاحية.

انسخ الرسالة أدناه وشاركها. 👇`
  },

  settings: {
    'invalid-username': `❌ *خطأ*

معرف الحساب هذا غير صالح. يرجى التحقق من المعرف الذي أدخلته والمحاولة مرة أخرى.`,

    'update-success': 'تغير',
    'username-show': `👤 *أدخل معرف الحساب*

الحروف الإنجليزية فقط والأرقام بين 3 و 15 حرفًا.

ملاحظة: هذا الإجراء نهائي ، لن تتمكن من تغيير معرف حسابك مرة أخرى.
`,
    'back-to-settings-cbbutton': '⬅️ الى الخلف',
    'settings-currency-updated': `يتم تحديث عملتك إلى * {{updatedCurrencyCode}} *.`,
    'show-rate-source': `📊 *مصدر معدل*

حدد مصدر سعر الصرف الذي تريد استخدامه.
*{{ exchangeSource }}* :نشط حاليا.

ملاحظة: سيؤثر تغيير هذا على طلباتك النشطة إذا استخدمت تسعير الهامش.
`,
    'show-more': '» أكثر من',
    'show-currency': `💵 *دقة*

انقر لتغيير عملتك.

أنت تستخدم حاليًا {{{fiatCurrencyCode}} *. اختر عملة انقر على "المزيد" لرؤية العملات الأخرى المتاحة.`,
    'show-language': `🌎 *لغة*

اختر لغة التطبيق.

ملاحظة: لن يتم تغيير الرسائل القديمة (المرسلة والمستلمة) إلى لغة جديدة.

*{{ language }}* :نشط حاليا`,
    'currency-cbbutton': '💵 دقة',
    'language-cbbutton': '🌎 لغة',
    'rate-source-cbbutton': '📊 مصدر معدل',
    'show-settings': `⚙️ الإعدادات

ما الذي تريد تعديله؟`,
    'username-cbbutton': '👤  تغيير معرف الحساب'
  }
}
