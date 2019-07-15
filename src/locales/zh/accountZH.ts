import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountZH = {
  home: {
    'passport-data-received': `✅ *收到身份*

您的验证文件已收到。这应该在3个工作小时内处理。我们会在处理时通知您`,
    'trade-message': `查看交易 ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 写信息',
    'send-response-cbbutton': '📝 写回复',
    'message-sent': '消息已发送',
    'new-photo-message': `📨 <b>来自的消息</b> ${
      BotCommand.ACCOUNT
    }{{ accountId }}
{{ tradeInfo }}
收到照片`,
    'message-not-sent': '❗️ 发送失败发送失败',
    'enter-message': '输入用户的消息。（最多400个字符',
    'new-message': `📨 <b>来自的消息</b> ${BotCommand.ACCOUNT}{{ accountId }}

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ 背部',
    'more-cbbutton': '更多 »',
    'no-reviews-available': '还没有评论',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *审查* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

按 *{{ reviewerName }}*。 交易 {{ tradeVolume }} {{ cryptoCurrencyCode }}。`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: '找不到此帐户。'
    },
    account: `👤  *我的帐户*

帐户 ID: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *总交易量:* {{ dealCount }}
💎 体积: {{ tradeVolume }}
⭐ 评分: {{ rating }}

🤝 推荐邀请: {{ referralCount }} 用户
💰 推荐收入: {{ earnings }}

💳 *支付方式:* {{ paymentMethods }}`,

    'dealer-account': `*帐户详细资料* (${BotCommand.ACCOUNT}{{ accountId }})

[电报联系 {{ firstName }}](tg://user?id={{ telegramUserId }})

💵 贸易优惠: {{ dealCount }}
💎 交易量: {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ 评分: {{ rating }}`,

    'user-reviews-cbbutton': '🗣 评测 ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️ 阻止用户',
    'unblock-dealer-cbbutton': '取消阻止用户',
    'verify-account-cbbutton': '🆔 验证KYC',
    'manage-payment-methods-cbbutton': '💳 支付方式',
    'referral-link-cbbutton': '🤝 推荐',
    'settings-cbbutton': '️⚙️ 设置',
    'no-payment-method': `没有`
  },

  'payment-method': {
    'does-not-exist': `❗️  *付款方式无效*

此付款方式不存在。

您可以请求 @{{supportBotUsername}} 来添加有效的付款方式。`,

    'create-error': '抱歉。我们无法创建此付款方式。请稍后再试。',
    'edit-cbbutton': '🖋  修改付款方式',
    'add-cbbutton': '➕  添加付款方式',
    'show-all': `💳 *支付方式*

{{ paymentMethodsList }}`,
    'show-edit': `*编辑付款方式*

点击您要修改的付款方式。`,
    'select-to-add': `*选择*

从下面的选项中选择要添加的付款方式。`,
    'edit-enter-field': '输入 *{{ fieldName }}*',
    created: `✅ 付款方式 *已添加*

您的付款方式已添加。

{{ paymentMethodInfo }}
现在，您可以在销售 {{ cryptoCurrencyCode }} 时使用此功能来接收资金。`,
    updated: `✅ *付款方式已更新*

您的付款方式已更新。

{{ paymentMethodInfo }}`,
    'none-added': `没有添加付款方式。当你卖东西时，他们会把钱转给你。`
  },

  referral: {
    'show-info': `🤝  *参考和赚取*

你的推荐人数: {{ referralCount }} 用户
推荐费: {{ referralFeesPercentage }}%

通过您推荐的每笔交易赚取比特币。您将获得 {{ referralFeesPercentage }}％ 的交易费用。

例如：如果您的推荐交易 1 BTC，您将获得我们收取的 0.008 BTC 的 0.004 BTC 作为费用。

立即处理并记入您的钱包。没有限制，没有到期日。

复制下面的消息并分享. 👇`
  },

  settings: {
    'invalid-username': `❌ *错误*

此帐户ID无效。请检查您输入的ID，然后重试.`,

    'update-success': '变',
    'username-show': `👤 *输入帐户ID*

只有3到15个字符的英文字母和数字。

注意：此操作是最终操作，您将无法再次更改您的帐户ID。
`,
    'back-to-settings-cbbutton': '⬅️ 背部',
    'settings-currency-updated': `您的货币已更新为 *{{ updatedCurrencyCode}}*.`,
    'show-rate-source': `📊 *评价来源*

选择您要使用的汇率来源。
目前活跃: *{{ exchangeSource }}*.

注意：如果您使用了保证金定价，更改此选项将影响您的有效订单。
`,
    'show-more': '更多 »',
    'show-currency': `💵 *货币*

点击更改您的货币。

您目前正在使用 *{{ fiatCurrencyCode }}*。选择一种货币。点击“更多”查看其他可用货币。`,
    'show-language': `🌎 *语言*

选择应用程序的语言。

注意：旧消息（已发送和已接收）不会更改为新语言

目前活跃: *{{ language }}*`,
    'currency-cbbutton': '💵 货币',
    'language-cbbutton': '🌎 语言',
    'rate-source-cbbutton': '📊 评价来源',
    'show-settings': `⚙️ 设置

你想要编辑什么？`,
    'username-cbbutton': '👤  更改帐户ID'
  }
}
