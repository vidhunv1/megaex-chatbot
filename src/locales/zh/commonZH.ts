import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonZH = {
  group: {
    'limit-updated': '更新限制！',
    unauthorized: '只有聊天管理员才能使用此命令。',
    'invalid-limit-number': 'setDailyLimit 的值应介于 0-24之间。',
    'special-message': `❕ 您可以将此机器人添加到您的群组或频道，并立即获得 BTC。
[点击这里阅读更多](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*你好*

我将在这里开始发送 BTC 费率提醒。

*Commands*
[/rate - 获取 BTC 的当前市场价格]
[/setDailyLimit 6] - 设置每天发送的费率提醒的数量。值应为 0  -  24.（仅适用于管理员）`,
    'account-linked': `❕这个机器人链接到 [{{ telegramName }}](tg://user?id={{ telegramUserId }})'s account on @{{ botUsername }}.`,
    'account-not-linked':
      '❕没有与此群组相关联的帐户。 [{{ telegramName }}](tg://user?id={{ telegramUserId }}) 可以给我留言 @{{ botUsername }} 或单击下面的按钮创建并链接帐户',
    'exchange-btc': '📊 买/卖BTC',
    'rate-alert-up': `*率警报*

🚀 BTC在 *{{ formattedRate}}* 的最后一小时内上涨 *{{change1h}}％*.

----------------
24h 体积: {{ formattedVolume24h }}
24h 更改: {{ change24h }}%
7d 更改: {{ change7d }}%
----------------`,
    'rate-alert-down': `*Rate alert*

🎢 BTC在 *{{ formattedRate }}* 的最后一小时内下降 *{{ change1h }}％*.

----------------
24h 体积: {{ formattedVolume24h }}
24h 更改: {{ change24h }}%
7d 更改: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *MegaX*

_在您的货币本地交换比特币的快速而简单的方法._
https://megax.in

*状态*: 线上
*提取费用*: {{ btcWithdrawalFee }}
*最小退出*: {{ btcWithdrawalMin }}
*接受者 费用*: {{ takerFeePercentage }}% (费用 快买 / 快卖 交易)
*制作者 费用*: {{ makerFeePercentage }}%
*推荐佣金*: {{ referralComission }}% 总交易费用.`,
    'join-group-cbbutton': '📣 MegaX 公告频道',
    'referral-cbbutton': '🤝 邀请推荐',
    'verify-account-cbbutton': '🆔 验证KYC',
    'guide-cbbutton': '📖 如何使用?',
    'support-cbbutton': '👨‍💼 支持'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 *来自admin的消息*',
    'support-message-title': '👩‍💼 *来自支持的消息*',
    'system-message-title': '🤖 *系统消息*'
  },
  'new-referral': `🤝 *新推荐*,

${BotCommand.ACCOUNT}{{ accountId }} 通过推荐链接加入。

您现在将收到所有交易的佣金。`,
  'callback-error-response': '❗️ 错误',
  'contact-legal-cbbutton': '👩‍🎓 联系支持',
  'contact-legal': `👩‍🎓 *客户支持*

联系与您的交易相关的问题或与您的交易/订单的任何争议（包括您的交易ID或其他信息，以快速解决您的问题）。

发信息: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 联系支持',
  'contact-support': `👨‍💼 *客户支持*

如果您需要与服务相关的支持。您可以报告与服务相关的任何问题，错误或反馈。

发信息: @{{ supportUsername }}
`,
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.KRAKEN]: 'Kraken'
  },
  updated: 'Updated!',
  'cryptocurrency-names': {
    BTC: 'Bitcoin'
  },
  cancel: '取消',
  actions: {
    'cancel-keyboard-button': '取消',
    'back-inline-button': '« 背部',
    'more-inline-button': '更多'
  },
  'action-canceled': '此操作已取消。',
  error: {
    unknown: '❗️❗️ 哎呀！发生错误。我们正在研究这个问题。请稍后再试。',
    'bad-message': `👮‍ *Megadeals 支持团队:*

如果您遇到任何问题，我们将全天候为您提供帮助。联系我们的团队 @{{ supportBotUsername }}

⚠️ 重要提示：永远不要在此机器人之外进行任何交易，我们将无法保护和收回您的资金。

ℹ️  *关于 Megadeals:*

MegaDeals 是一个安全的交换机器人用你的本地货币买/卖比特币。 `
  },
  bot: {
    name: 'BTC 交易',
    support: {
      name: 'BTC 交易支持'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: '购买',
      [OrderType.SELL]: '卖'
    }
  },
  'main-menu': {
    exchange: '💵 交换 BTC-{{ fiatCurrency }}',
    account: '👤 我的帐户',
    wallet: '💼 钱包',
    info: '🔷 信息'
  },
  'unhandled-callback': `抱歉!您对此请求的会话已过期。请再次提出新请求。`,
  'payment-methods': {
    names: {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS 银行转帐',
      // RUB
      [PaymentMethodType.SBERBANK]: 'SberBank',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChat',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: '国家银行转账',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: '现金交易',
      [PaymentMethodType.CASH_DEPOSIT]: '现金存款',
      [PaymentMethodType.CREDIT_CARD]: '信用卡',
      [PaymentMethodType.SKRILL]: 'Skrill',
      [PaymentMethodType.OKPAY]: 'OkPay',
      [PaymentMethodType.WESTERN_UNION]: 'Western Union',
      [PaymentMethodType.WEBMONEY]: 'WebMoney',
      [PaymentMethodType.NETTELLER]: 'Netteller',
      [PaymentMethodType.INTERNATIONAL_WIRE]: 'International Wire',
      [PaymentMethodType.AMAZON_GIFT_CARD]: 'Amazon Gift card',
      [PaymentMethodType.PAXUM]: 'Paxum',
      [PaymentMethodType.PAYONEER]: 'Payoneer',
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 'Cryptocurrency altcoin',
      [PaymentMethodType.OTHER]: '其他'
    },
    'short-names': {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS',
      // RUB
      [PaymentMethodType.SBERBANK]: 'SberBank',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChay',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: '国家银行转账',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: '现金交易',
      [PaymentMethodType.CASH_DEPOSIT]: '现金存款',
      [PaymentMethodType.CREDIT_CARD]: '信用卡',
      [PaymentMethodType.SKRILL]: 'Skrill',
      [PaymentMethodType.OKPAY]: 'OkPay',
      [PaymentMethodType.WESTERN_UNION]: 'Western Union',
      [PaymentMethodType.WEBMONEY]: 'WebMoney',
      [PaymentMethodType.NETTELLER]: 'Netteller',
      [PaymentMethodType.INTERNATIONAL_WIRE]: 'International Wire',
      [PaymentMethodType.AMAZON_GIFT_CARD]: 'Amazon Gift card',
      [PaymentMethodType.PAXUM]: 'Paxum',
      [PaymentMethodType.PAYONEER]: 'Payoneer',
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: 'Cryptocurrency altcoin',
      [PaymentMethodType.OTHER]: '其他'
    },
    fields: {
      [PaymentMethodType.PAYTM]: {
        field1: '手机号码'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI ID'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: '银行名',
        field2: '帐号',
        field3: 'IFSC 代码'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: '完成 付款详情'
      },
      [PaymentMethodType.QIWI]: {
        field1: '付款详情'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: '付款详情'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: '付款详情'
      },
      [PaymentMethodType.WECHAT]: {
        field1: '付款详情'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: '银行名',
        field2: '帐户详细资料'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: '电子邮件'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: '位置 / 城市'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: '付款详情'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: '付款详情'
      },
      [PaymentMethodType.SKRILL]: {
        field1: '付款详情'
      },
      [PaymentMethodType.OKPAY]: {
        field1: '付款详情'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: '付款详情'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: '付款详情'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: '付款详情'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: '付款详情'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: '付款详情'
      },
      [PaymentMethodType.PAXUM]: {
        field1: '付款详情'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: '付款详情'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Altcoin ticker name',
        field2: 'Altcoin address'
      },
      [PaymentMethodType.OTHER]: {
        field1: '全额付款详情'
      }
    }
  },
  'show-transactions-title': `📗 *Transactions*

*硬币*        *量*               *类型*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
