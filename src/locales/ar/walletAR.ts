import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletAR = {
  /* Home */
  home: {
    wallet: `💼  *محفظة بيتكوين*

توازن:    {{ cryptoBalance }}
القيمة:    {{ fiatBalance }}
مسدود:    {{ blockedBalance }}

دعوة:    {{ referralCount }} المستخدمين
أرباح:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ إرسال',
    'my-address': '📩  الوديعة',
    withdraw: '📤  سحب',
    'transaction-credit': 'ائتمان',
    'transaction-debit': 'مدين'
  },

  /* الوديعة */
  deposit: {
    'show-address': `
📩  *الوديعة {{ cryptoCurrencyCode }}*

ستتوفر الأموال في محفظتك بعد تأكيد {{ confirmations }} على الشبكة. استخدم عنوان {{ cryptoCurrencyCode }} أدناه لإيداع الأموال في محفظتك.

ملاحظة: * إيداع فقط {{cryptoCurrencyCode}} الأموال * لهذا العنوان.`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *المبلغ المراد إرساله*

أدخل المبلغ في {{cryptoCurrencyCode}} أو {{fiatCurrencyCode}}.

مثال: {{ cryptoCurrencyBalance }}

متاح: {{ cryptoCurrencyBalance }}
    القيمة: {{ fiatValue }}`,
    تؤكد: `👁‍🗨*Confirm*

هل هذا صحيح؟ إذا كانت الإجابة بنعم ، انقر فوق * "تأكيد" *.

كمية: {{ cryptoCurrencyAmount }}
 القيمة:  {{ fiatValue }})
`,
    'confirm-button': '✔️  تؤكد',
    'insufficient-balance': `❗️  *رصيد غير كاف*

أضف {{cryptoCurrencyCode}} إلى محفظتك لإرسال هذه الدفعة.

*الرصيد المتوفر*: {{ cryptoCurrencyBalance}}`,
    'مبلغ غير صحيح': `❗️  *المبلغ غير صالح*

أدخل مبلغ صالح.`,
    'error-creating-payment':
      'حدث خطأ أثناء إنشاء هذه الدفعة ، يرجى إعادة المحاولة لاحقًا.',
    'show-created-link': `✅  *تحقق خلق*

{{ paymentLink }}
مشاركة هذا الرابط من القطاع الخاص. أي شخص لديه حق الوصول إلى هذا الرابط سيحصل على الأموال.

ستنتهي صلاحية هذا الرابط في * {{expiryTime}} ساعات *.`,
    'payment-link-expired':
      'انتهت صلاحية رابط الدفع الذي قمت بإنشائه من *{{cryptoValue}}*.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]: 'تم المطالبة بربط الدفع هذا.',
      [TransferErrorType.EXPIRED]: 'انتهت صلاحية رابط الدفع هذا.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `ليس لدى حساب المستخدمين رصيد كافٍ لهذه الدفعة ، يمكنك الاتصال بهم لتمويل حسابهم لإعادة محاولة الدفع.

*اتصل*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'رابط الدفع هذا غير صالح.',
      [TransferErrorType.SELF_CLAIM]: `✅  *رابط الدفع*

كمية: *{{ cryptoValue }}*
مشاركة الرابط من القطاع الخاص لإرسال الأموال. أي شخص لديه حق الوصول إلى هذا الرابط سيحصل على الأموال.
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'حدث خطأ. الرجاء معاودة المحاولة في وقت لاحق.'
    },
    'payment-success': {
      receiver: `✅ *ائتمان جديد*
لقد تلقيت *{{ cryptoValueReceived }}* من [{{ senderName }}](tg://user?id={{ senderTelgramId }}).`,
      sender: `✅ *الخصم الجديد*

تلقى [{{ receiverName }}](tg://user?id={{ receiverTelegramId }}) *{{ cryptoValueSent }}* من رابط الدفع الخاص بك.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*سحب BTC*

أدخل المبلغ في * {{cryptoCurrencyCode}} * للسحب.
مثال: 0.018291 BTC

المتوفر: {{cryptoCurrencyBalance}}
القيمة: {{fiatValue}}`,
    'input-address': `*عنوان BTC*

أدخل عنوان محفظة {{cryptoCurrencyName}} التي تريد الانسحاب إليها.
`,
    'insufficient-balance': `❗️ *رصيد غير كاف*

الأموال في المحفظة منخفضة جدا. أضف الأموال وحاول مرة أخرى.

*الرصيد المتوفر*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *عنوان خاطئ*

تحقق من عنوان * {{cryptoCurrencyName}} * وحاول مرة أخرى.
`,
    'less-than-min-error': `❗️ الحد الأدنى لمبلغ السحب هو *{{minWithdrawAmount}}*.
`,
    'create-error': `حدث خطأ.

الرجاء معاودة المحاولة في وقت لاحق. إذا كنت لا تزال تواجه مشكلة ، فاتصل بالدعم @{{ supportUsername}}`,
    confirm: `👁‍🗨  *التحقق من التفاصيل*

إلى عنوان: {{ toAddress }}
    كمية: {{ cryptoCurrencyAmount }}
     القيمة: {{ fiatValue }})
`,
    'confirm-button': '✔️ تؤكد',
    'create-success': `⏳ *معالجة السحب ...*

طلب السحب الخاص بك في قائمة الانتظار. ستتلقى إشعارًا عند معالجته.

سيتم استخدام رسوم شبكة *{{feeValue}}*.`,
    'withdraw-processed': `✅ *اكتمل السحب*

اكتمال سحب *{{cryptoCurrencyAmount}}*.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *{{ cryptoCurrencyCode }} الواردة*

لديك إيداع جديد لـ * {{cryptoCurrencyValue}} *. ستتم إضافته بعد تأكيد {{requiredConfirmation}} على الشبكة.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  *{{ cryptoCurrencyCode }} تم الاستلام*

إضافة إلى المحفظة *{{ cryptoCurrencyValue }}*.`,
    'source-name': {
      core: 'الوديعة',
      payment: 'دفع',
      withdrawal: 'سحب',
      release: 'إطلاق سراح',
      block: 'منع',
      trade: 'تجارة',
      comission: 'العمولة',
      fees: 'رسوم'
    }
  }
}
