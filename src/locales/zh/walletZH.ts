import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletZH = {
  /* Home */
  home: {
    wallet: `💼  *比特币 钱包*

账户余额:    {{ cryptoBalance }}
值:    {{ fiatBalance }}
阻止:    {{ blockedBalance }}

邀请:    {{ referralCount }} users
收益:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ 发送',
    'my-address': '📩  存款',
    withdraw: '📤  退出',
    'transaction-credit': '信用',
    'transaction-debit': '借方'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *存款 {{ cryptoCurrencyCode }}*

在{{ confirmmations }}网络确认后 资金将在您的钱包中提供。使用下面的{{ cryptoCurrencyCode }}地址将资金存入您的钱包

注意：*仅将{{cryptoCurrencyCode}}资金*存入此地址`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *发送金额*

在* {{ cryptoCurrencyCode }} *或* {{ fiatCurrencyCode }}中输入金额*

例: {{ cryptoCurrencyBalance }}

可得到: {{ cryptoCurrencyBalance }}
    值: {{ fiatValue }}`,
    confirm: `👁‍🗨*确认*

它是否正确？如果是 请单击*"确认"*：

量: {{ cryptoCurrencyAmount }}
值:  {{ fiatValue }})
`,
    'confirm-button': '✔️  确认',
    'insufficient-balance': `❗️  *不充足的资金*

将{{ cryptoCurrencyCode }}添加到您的钱包中以发送此付款

*可用余额*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❗️  *金额无效*

输入有效金额`,
    'error-creating-payment': '创建此付款时出错，请稍后再试',
    'show-created-link': `✅  *检查已创建*

{{ paymentLink }}
私下分享这个链接。有权访问此链接的任何人都将获得资金

此链接将于到期 *{{ expiryTime }} 小时*.`,
    'payment-link-expired': '您创建的* {{cryptoValue}} *的付款链接已过期',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]: '此付款链接已被声明',
      [TransferErrorType.EXPIRED]: '此付款链接已过期',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `用户帐户余额不足以支付此款项，您可以与他们联系以资助其帐户以重新付款

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: '此付款链接无效',
      [TransferErrorType.SELF_CLAIM]: `✅  *付款链接*

量: *{{ cryptoValue }}*
私下分享链接以发送资金。有权访问此链接的任何人都将获得资金
`,
      [TransferErrorType.TRANSACTION_ERROR]: '发生错误。请稍后再试'
    },
    'payment-success': {
      receiver: `✅ *新信用*

您收到了来自 [{{ senderName }}] 的 *{{ cryptoValueReceived }}*（tg://user？id = {{ senderTelegramId }}）`,
      sender: `✅ *新借记卡*

[{{ receiverName }}]（tg://userid = {{ receiverTelegramId }}）从您的付款链接收到 *{{ cryptoValueSent }}*`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*退出 BTC*

在 *{{ cryptoCurrencyCode }}* 中输入金额以退出
Example: 0.018291 BTC

可得到: {{ cryptoCurrencyBalance }}
值: {{ fiatValue }}`,
    'input-address': `*BTC 地址*

输入要撤消的 {{ cryptoCurrencyName }} 钱包的地址
`,
    'insufficient-balance': `❗️ *不充足的资金*

钱包里的资金太低了。添加资金并重试

*可用余额*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *无效地址*

检查 *{{ cryptoCurrencyName }}* 地址 然后重试
`,
    'less-than-min-error': `❗️ 最低提款金额为 *{{ minWithdrawAmount }}*
`,
    'create-error': `发生错误

请稍后再试 如果您仍然遇到问题 请联系 支持 @{{ supportUsername }}`,
    confirm: `👁‍🗨  *验证细节*

至 地址: {{ toAddress }}
    量: {{ cryptoCurrencyAmount }}
     值: {{ fiatValue }})
`,
    'confirm-button': '✔️ 确认',
    'create-success': `⏳ *提款处理.....*

您的提款请求已排队。您将在处理完毕后收到通知

将使用* {{feeValue}} *的网络费用`,
    'withdraw-processed': `✅ *提款已完成*

您的 *{{ cryptoCurrencyAmount }}* 的撤销已完成

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *来 {{ cryptoCurrencyCode }}*

您有*{{ cryptoCurrencyValue }}* 的新存款将在网络上 {{ requiredConfirmation }} 确认后添加

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  *{{ cryptoCurrencyCode }} 收到*

*{{ cryptoCurrencyValue }}* 添加到钱包.`,
    'source-name': {
      core: '存款',
      payment: '付款',
      withdrawal: '退出',
      release: '发布',
      block: '块',
      trade: '贸易',
      comission: '佣金',
      fees: '费用'
    }
  }
}
