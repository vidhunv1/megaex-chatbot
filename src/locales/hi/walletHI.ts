import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletHI = {
  /* Home */
  home: {
    wallet: `💼  *बिटकॉइन वॉलेट*

खाते में शेष:    {{ cryptoBalance }}
मूल्य:    {{ fiatBalance }}
खाते में बंद:    {{ blockedBalance }}

आमंत्रित संख्या:    {{ referralCount }} users
कमाई:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ भेजें',
    'my-address': '📩  जमा करें',
    withdraw: '📤  वापस लें',
    'transaction-credit': 'क्रेडिट्',
    'transaction-debit': 'डेबिट'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *{{ cryptoCurrencyCode }} जमा करें*

{{ confirmations }} नेटवर्क पुष्टिकरण के बाद आपके वॉलेट में फंड उपलब्ध होगा। अपने वॉलेट में धन जमा करने के लिए नीचे दिए {{ cryptoCurrencyCode }} अद्द्रेस्स् का उपयोग करें।

नोट: * इस अद्द्रेस्स् पर केवल {{ cryptoCurrencyCode }} फंड * जमा करें।`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *भेजी जाने वाली राशि*

राशि को {{{cryptoCurrencyCode}} * या * {{fiatCurrencyCode}} * में दर्ज करें।

उदाहरण: {{ cryptoCurrencyBalance }}

उपलब्ध: {{ cryptoCurrencyBalance }}
    मूल्य: {{ fiatValue }}`,
    confirm: `👁‍🗨*पुष्टि करें*

क्या ये सही है? अगर सही है, तो *"पुष्टि करें"* पर क्लिक करें।:

BTC राशि: {{ cryptoCurrencyAmount }}
 मूल्य:  {{ fiatValue }})
`,
    'confirm-button': '✔️  पुष्टि करें',
    'insufficient-balance': `❗️  *अपर्याप्त राशि*

यह भुगतान भेजने के लिए अपने वॉलेट में {{cryptoCurrencyCode}} जोड़ें।

*उपलब्ध राशि*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❗️  *राशि अमान्य*

एक उचित राशि दर्ज करें।`,
    'error-creating-payment':
      'इस भुगतान को बनाने में एक त्रुटि हुई, कृपया बाद में पुनः प्रयास करें।',
    'show-created-link': `✅  *चेक बनाया गया*

{{ paymentLink }}
इस लिंक को निजी तौर पर साझा करें। इस लिंक तक पहुंचने वाले किसी भी व्यक्ति को राशि मिल जाएगी।

यह लिंक *{{ expiryTime }} घंटे* में समाप्त हो जाएगा।`,
    'payment-link-expired':
      'आपके द्वारा *{{ cryptoValue }}* का भुगतान लिंक समाप्त हो गया है।',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'इस भुगतान लिंक का पहले से ही इस्तेमाल किया गया है।',
      [TransferErrorType.EXPIRED]:
        'इस भुगतान लिंक की समय सीमा समाप्त हो गई है।',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `इस भुगतान के लिए उपयोगकर्ताओं के खाते में अपर्याप्त राशि है, आप इस भुगतान को पुनः प्राप्त करने के लिए उनसे संपर्क कर सकते हैं।

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'यह भुगतान लिंक अमान्य है।',
      [TransferErrorType.SELF_CLAIM]: `✅  *भुगतान लिंक*

राशि: *{{ cryptoValue }}*
BTC भेजने के लिए निजी रूप से लिंक साझा करें। इस लिंक तक पहुंचने वाले किसी भी व्यक्ति को राशि मिल जाएगी।
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'एक त्रुटि पाई गई। बाद में पुन: प्रयास करें।'
    },
    'payment-success': {
      receiver: `✅ *नया क्रेडिट*

आपको [{{ senderName }}](tg://user?id={{ senderTelgramId }}) से *{{ cryptoValueReceived }}* प्राप्त हुआ।`,
      sender: `✅ *नया डेबिट*

[{{ receiverName }}](tg://user?id={{ receiverTelegramId }}) ने आपके भुगतान लिंक से *{{ cryptoValueSent }}* प्राप्त किया`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*BTC वापस ले*

वापस लेने के लिए *{{ cryptoCurrencyCode }}* में राशि दर्ज करें।
उदाहरण: 0.018291 BTC

उपलब्ध: {{ cryptoCurrencyBalance }}
मूल्य: {{ fiatValue }}`,
    'input-address': `*BTC अद्द्रेस्स्*

{{ CryptoCurrencyName }} वॉलेट का जिसपे दर्ज करें जिसपे आप वापस लेना चाहते हैं।
`,
    'insufficient-balance': `❗️ *अपर्याप्त फंड*

वॉलेट में फंड बहुत कम हैं। फंड जोड़ें और पुन: प्रयास करें।

*उपलब्ध शेष राशि*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *गलत अद्द्रेस्स्*

*{{ CryptoCurrencyName }}* अद्द्रेस्स् की जांच करें और फिर से कोशिश करें।
`,
    'less-than-min-error': `❗️ न्यूनतम निकासी राशि *{{ minWithdrawAmount }}* है.
`,
    'create-error': `एक त्रुटि पाई गई।

बाद में पुन: प्रयास करें। यदि आप अभी भी किसी समस्या का सामना कर रहे हैं, तो समर्थन @{{ supportUsername }} से संपर्क करें`,
    confirm: `👁‍🗨  *विवरण सत्यापित करें*

BTC अद्द्रेस्स्: {{ toAddress }}
    राशि: {{ cryptoCurrencyAmount }}
     मूल्य: {{ fiatValue }})
`,
    'confirm-button': '✔️ पुष्टि करें',
    'create-success': `⏳ *वापसी हो रहा...*

आपका निकासी अनुरोध कतार में है। इसके संसाधित होने पर आपको एक सूचना प्राप्त होगी।

नेटवर्क शुल्क *{{ feeValue }}* का उपयोग किया जाएगा।`,
    'withdraw-processed': `✅ *वापसी पूरी हुई*

आपकी *{{ cryptoCurrencyAmount }}* राशि की वापसी पूरी हो गई है।

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *{{ cryptoCurrencyCode }} आ रहा है*

आपके पास *{{ cryptoCurrencyValue}}* का एक नया जमा हुआ है। नेटवर्क पर {{ cryptoCurrencyValue }} पुष्टिकरण के बाद जोड़ा जाएगा।

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  आपने *{{ cryptoCurrencyCode }} प्राप्त किया*

*{{ cryptoCurrencyValue }}* वॉलेट में जोड़ दीया गया है।`,
    'source-name': {
      core: 'deposit',
      payment: 'payment',
      withdrawal: 'withdraw',
      release: 'release',
      block: 'block',
      trade: 'trade',
      comission: 'comission',
      fees: 'fees'
    }
  }
}
