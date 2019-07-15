import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeZH = {
  home: {
    exchange: `💵  *交换BTC -{{ fiatCurrency }}*

✅  通过{{ supportBotUsername }}提供全天候支持
🔒  所有交易均以托管保证担保

市场利率: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': '我的活跃 ({{ orderCount }})',
    'create-order-cbbutton': '📊 创建订单',
    'buy-cbbutton': '📉 快速购买',
    'sell-cbbutton': '📈 快速销售'
  },

  deals: {
    'no-quick-sell': `📉  *快速购买*

没有活跃的买单 创建新的购买订单`,
    'new-quick-sell-cbbutton': '📗 新买单',
    'no-quick-buy': `📉  *快速销售*

没有活跃的卖单 创建新的卖单`,
    'new-quick-buy-cbbutton': '📕 新卖单',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *争议已经解决*

在根据双方提交的证据进行仔细审核后 我们确认您对交易是真实的

已对买方采取适当行动 对由此造成的不便 我们深表歉意

锁定的资金已经*被释放* 检查你的钱包`,
      'dispute-resolved-buyer-win': `👩‍🎓  *争议已经解决*

在根据双方提交的证据进行仔细审核后 我们确认您对交易是真实的

已对卖方采取适当行动 对由此造成的不便 我们深表歉意

{{cryptoAmount}}已被*记入* 检查你的钱包`,
      'dispute-resolved-seller-lose': `👩‍🎓  *争议已经解决*

在根据双方提交的证据进行仔细审核后 我们确认您在该交易中存在过错

注意：重复犯罪将导致永久禁令`,
      'dispute-resolved-buyer-lose': `‍🎓  *争议已经解决*

根据双方提交的证据进行仔细审核后 我们确认您在此交易中存在过错

注意：重复犯罪将导致永久禁令`,
      'referral-comission': `🚀  *收到佣金*

恭喜您从推荐行业收到{{ cryptoAmount }}佣金继续邀请`,
      'open-dispute-cbbutton': '👩‍🎓 公开发行',
      'dispute-initiator': `*贸易支持* ${BotCommand.TRADE}{{ tradeId }}

这个行业已经出现了一个问题 贸易暂时受阻 请联系@{{ legalUsername }}来解决此问题`,
      'dispute-received': `*贸易支持* ${BotCommand.TRADE}{{ tradeId }}

用户提出了此交易的问题

请联系@{{ legalUsername }}来解决此问题`,
      'confirm-payment-received': `*付款确认*

您确定已收到买家的*{{ fiatAmount }}*吗`,
      'confirm-payment-received-yes-cbbutton': '是',
      'confirm-payment-received-no-cbbutton': '没有',
      'payment-released-buyer': `🚀 *记入{{ cryptoCurrency }}* ${
        BotCommand.TRADE
      }{{ tradeId }}

您的钱包从此交易中获得*{{ cryptoAmount }}*`,
      'payment-released-seller': `🚀 *成功的贸易* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}*从您的钱包中扣除并发放给买家`,
      'give-rating': `🏅  *评价这笔交易*

给出这个交易的评级`,
      'give-review': `🗣  *贸易评论*

写下这笔交易的简短评论`,
      'end-review': `评论补充说

🎉 邀请您的朋友 以便他们也可以获得最佳体验 您可以使用您的推荐从他们的交易中赚取费用

{{ referralLink }}`,
      'skip-review': '跳跃 ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*确认付款*

您是否已将*{{ fiatAmount }} *发送给卖家* {{ paymentMethodType }}*？`,
      'confirm-payment-sent-yes-cbbutton': '是',
      'confirm-payment-sent-no-cbbutton': '没有',
      'payment-sent-buyer': `*🛎 贸易* ${BotCommand.TRADE}{{ tradeId }}

卖家已收到通知 请等待卖家确认您的付款

如果没有确认 你可以'提出问题'`,
      'payment-sent-seller': `🛎  *付款确认成功* ${BotCommand.TRADE}{{ tradeId }}

买方已将*{{ fiatAmount }}*发送至您的{{ paymentMethod }} * 请在收到付款时确认

如果您没有收到付款 您可以*提出问题*`,
      'escrow-warn-seller': `*信息*

买方尚未支付交易费用 ${BotCommand.TRADE}{{ tradeId }}.

如果您认为有问题 可以联系我们的*支持* 他们会帮助您

如果*{{ paymentSendTimeout }}分钟*未收到确认 则会自动向您发放冻结金额`,
      'escrow-warn-buyer': `*交易付款提醒*

您尚未支付交易费用 ${
        BotCommand.TRADE
      }{{ tradeId }}. 如果您已付款 请点击“我已付款”

⚠️ 您需要*{{ paymentSendTimeout }}分钟*来支付此款项 之后的任何付款都将无效`,
      'escrow-closed-seller': `🤷‍♂️  *贸易关闭*

买方没有支付并确认交易付款 ${BotCommand.TRADE}{{ tradeId }}.

您的*{{ cryptoAmount }}*已退还给您 有关此交易的问题 请联系我们的*支持*`,
      'escrow-closed-buyer': `🤷‍♂️  *贸易结束*

您没有向卖家支付任何款项 ${
        BotCommand.TRADE
      }{{ tradeId }}. 有关此交易的问题 请联系我们的*支持`,
      'cancel-trade-confirm': `您确定要取消交易吗？ ${
        BotCommand.TRADE
      }{{ tradeId }} 上 *{{ fiatAmount }}*?

⚠️ 如果您已向卖家付款 请勿取消`,
      'cancel-trade-confirm-yes-cbbutton': '是',
      'cancel-trade-confirm-no-cbbutton': '没有',
      'cancel-trade-success': '这笔交易被你取消了',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': '交易已经取消或已经过期',
      'cancel-trade-notify': `❗️贸易 ${
        BotCommand.TRADE
      }{{ tradeId }} 被用户取消了`,
      'trade-rejected-notify':
        '用户取消了此交易 您可以在 快买 要么 快速销售 下选择其他优惠。',
      'trade-rejected-success': '你拒绝了这笔交易',
      'trade-accepted-seller-success': `🛎 *贸易公开* ${
        BotCommand.TRADE
      }{{ tradeId }}

用户已收到通知*{{ fiatPayAmount }}*存入您的*{{ paymentMethodName }}*

[Telegram 联系](tg://user?id={{ buyerUserId }})

此付款已标记为已完成后 您会收到通知`,
      'trade-accepted-buyer-no-payment-info':
        '向卖家发送消息以获取付款详细信息.',
      'trade-accepted-buyer': `🛎  *已接受贸易* ${BotCommand.TRADE}{{ tradeId }}

通过{{ paymentMethodName }}付款{{ fiatPayAmount }} 您的付款确认后会收到*{{ cryptoAmount }}*

*{{ paymentMethodName }}*
量: *{{ fiatPayAmount }}*
付款凭据: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram 联系](tg://user?id={{ buyerUserId }})

🔒 这笔交易是安全的 付款仅适用于*{{ paymentSendTimeout }}分钟*`,
      'payment-received-cbbutton': '💵  已收到付款',
      'payment-sent-cbbutton': '💸  我付了',
      'trade-accepted-fail': '️抱歉 开启此交易时出错',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ 您已经拥有此订单的现有交易 您不能为同一订单放置多笔交易',
        [TradeError.NOT_FOUND]: '❗️ 我们找不到这笔交易',
        [TradeError.TRADE_EXPIRED]: '❗️ 此交易无效或已过期',
        [TradeError.INSUFFICIENT_BALANCE]: '❗️ 您没有足够的余额来开启此交易'
      },
      'init-get-confirm-buy': `🛎 *新贸易* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{requestorAccountId}}想要以价格{{fixedRate}}购买*{{ cryptoCurrencyAmount }}* 对于 * {{ fiatValue }} *

你想接受这笔交易吗`,
      'init-get-confirm-sell': `🛎 *新贸易* ${BotCommand.TRADE}{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{requestorAccountId}}想以价格{{ fixedRate }}出售*{{ cryptoCurrencyAmount }}* 对于 *{{ fiatValue }}*.

你想接受这笔交易吗？`,
      'trade-init-yes-cbbutton': '是',
      'trade-init-no-cbbutton': '没有',
      'trade-init-no-response': `💤 *没有反应*

此用户目前正在离开。请尝试其他交易。`,
      'trade-init-expired': `⏳ *交易已过期*

由于您没有回复，交易请求 ${BotCommand.TRADE}{{ tradeId }} 已过期并取消.

如果您不在，可以轻松暂停订单。这确保了其他交易者的良好体验。`
    },
    'request-deposit-notify': `🛎  *新购买请求*

您的订单上有新的购买请求 ${BotCommand.ORDER}{{ orderId }}.

*{{ requesterName }}* 想购买 *{{ formattedCryptoValue }}* 对于 *{{ formattedFiatValue }}*.

[Telegram 联系](tg://user?id={{ requesterUserId }})

⚠️ 您需要存入所需的资金才能开始此交易`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: '订单未找到',
      [DealsError.SELF_OPEN_DEAL_REQUEST]: '您无法按自己的订单开立交易!',
      default: '抱歉。发生错误。请稍后再试。'
    },
    'next-cbbutton': '下一个',
    'prev-cbbutton': '上一页',
    'show-buy-deals': `📉 *快速购买* ({{ currentPage}}/{{ totalPages }})

请选择您要购买的订单。

价钱 / {{ cryptoCurrencyCode }}, 显示付款方式和交易者评级。
`,
    'show-sell-deals': `📈 *快速销售* ({{ currentPage}}/{{ totalPages }})

选择您要销售的订单。

*价钱 / {{ cryptoCurrencyCode }}*, *显示付款方式*和*买方评级*。
`,
    'id-verified': '验证: ✅ KYC验证',
    'show-buy-deal': `📉 *购买 {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

这笔交易是由 *{{ realName }}*.
{{ verificationText }}
帐户ID: ${BotCommand.ACCOUNT}{{ accountId }}
评分:  {{ rating }} ⭐️

*付款详情*:
-----------------
付款方法: {{ paymentMethodName }}
条款: _{{ terms }}_

*贸易细节*:
----------------
价钱: {{ rate }} / {{ cryptoCurrencyCode }}
购买金额: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *卖 {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

此卖单是由 *{{ realName }}*.
{{ verificationText }}
帐户ID: ${BotCommand.ACCOUNT}{{ accountId }}
评分:  {{ rating }} ⭐️

*付款详情*:
-----------------
付款方法： {{ paymentMethodName }}
条款: _{{ terms }}_

*贸易细节*:
----------------
价钱: {{ rate }} / {{ cryptoCurrencyCode }}
卖出金额: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `交易员账户资金不足以开始交易。要求卖方存入资金，之后可以开始交易。`,
    'request-buy-deal-deposit-cbbutton': '📲 联系卖方',

    'open-buy-deal-cbbutton': '🛎 从这里购买 {{ cryptoCurrencyCode }}',
    'open-sell-deal-cbbutton': '🛎 从这里出售 {{ cryptoCurrencyCode }}',
    'back-cbbutton': '⬅️ 背部',
    'user-reviews': '💬 用户评论',
    'input-buy-amount': `💵  *输入购买金额*

在 *{{ minFiatValue}}* 和 *{{ maxFiatValue }}* 之间输入 {{ fiatCurrencyCode }} 金额。

例如: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵  *输入卖出金额*

在 *{{ minFiatValue }}* 和 *{{ maxFiatValue }} 之间输入 {{ fiatCurrencyCode }} 金额*.

例如: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*付款详情*

选择或添加 *{{ paymentMethodType }}* 的新付款详细信息，以便买家向您发送款项。`,
    'skip-input-payment-details': '跳跃',
    'add-payment-details': '➕ 加 {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*打开这笔交易?*

您确定要以价格 {{ rate }} 购买 *{{ cryptoValue }}* for *{{ fiatValue }}* 吗？

❕ 点击 *'是'*, 您同意交易条款.`,

    'confirm-input-sell-amount': `*打开这笔交易？*

您确定要以价格 *{{ rate }}* * {{ fiatValue }} * 出售 *{{ cryptoValue }}*？

❕ 点击 *'是'*, 您同意交易条款`,
    'confirm-input-amount-yes-cbbutton': '是',
    'confirm-input-amount-no-cbbutton': '没有',
    'show-open-deal-request': `📲 *请求已发送!*

您的请求已被发送，此交易仅在卖方存入所需资金后才开始。

⚠️ 重要提示：在此处确认存款之前，切勿进行任何付款。不要在MegaDeals之外做任何交易，你可能会失去你的钱。

*卖家 电报 联系*: [电报 联系](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': '交易取消了',
    'trade-opened-message': '贸易现在很活跃!',
    'show-opened-trade': `*贸易* ${BotCommand.TRADE}{{ tradeId }}

等待 ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. 如果用户未在 {{ timeoutMinutes }} 分钟内确认交易开始，则交易将自动取消。

⚠️ 重要提示：出于安全原因，请勿在Megadeals之外进行任何交易。

如果您已经付款 请勿取消交易

*{{ timeoutMinutes }}分钟*自动取消*`,
    'cancel-trade-cbbutton': '🚫 取消交易'
  },

  'my-orders': {
    'my-sell-order-cbbutton': '卖单 @ {{ rate }}',
    'my-buy-order-cbbutton': '买单 @ {{ rate }}',
    'buy-deal-cbbutton': '🛎 买入交易 - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎 卖出交易 - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 存款 {{ cryptoCurrencyCode }}',
    'show-active-orders': `*活跃订单*

列出您正在进行的交易和订单
`,
    'order-enabled': '您的订单现在有效',
    'input-payment-details-field': `写下*{{ fieldName }}*代表*{{ paymentMethod }}*`,
    'order-disabled': `您的订单设置为无效.
点击*'有效'*按钮启用此订单.`,
    'show-orders': 'TODO: 显示我的订单',

    'terms-not-added': '没有',
    'my-buy-order-info': `📗  *我的订单* - ${BotCommand.ORDER}{{orderId}}

*状态*: {{ status }}
*{{ cryptoCurrencyCode }} 价钱*: {{ rate }}
*最低金额*: {{ minAmount }}
*最高金额*: {{ maxAmount }}
*付款方法*: {{ paymentMethod }}

条款: _{{ terms }}_

*订单链接*: {{ orderLink }}
分享这个链接 点击此链接的人可以与您进行交易
`,
    'payment-info-not-added': '没有添加',
    'insufficient-sell-order-balance':
      '⚠️ 余额不足 存入最低金额以开始此订单的交易',
    'my-sell-order-info': `*📕 我的卖单* - ${BotCommand.ORDER}{{orderId}}

*状态*: {{ status }}
*{{ cryptoCurrencyCode }} 价钱*: {{ rate }}
*最低金额*: {{ minAmount }}
*最高金额*: {{ maxAmount }}
*付款方法*: {{ paymentMethod }}
*付款信息*: {{ paymentInfo }}

条款: _"{{ terms }}"_

*订单链接*: {{ orderLink }}
分享此链接并直接与其他交易者开立交易
`,
    'edit-amount-cbbutton': '⚖️ 量',
    'edit-rate-cbbutton': '💸  BTC价格',
    'edit-terms-cbbutton': '📝 条款',
    'edit-payment-method-cbbutton': '💳 付款方法',
    'toggle-active-cbbutton': '活性',
    'delete-order-cbbutton': '🗑️ 删除!',
    'edit-order': '✏️ 编辑订单',
    'go-back-cbbutton': '⬅️ 背部',
    'order-edit-success': '✅ 您的订单已更新',
    'edit-payment-details': '📃 更新付款信息',
    'order-edit-rate': `*设置{{ cryptoCurrencyCode }}价格*

在* {{ fiatCurrencyCode }} *中输入{{ cryptoCurrencyCode }}的固定价格，或输入百分比（％）来设置保证金价格。

例: *{{ marketRate }}* or *2%*`,
    'order-edit-terms': `📋 *条款*

写下您的交易条款。这将显示在您的订单上`,
    'order-delete-success': '订单已删除'
  },

  'create-order': {
    show: `📝 *创建订单*

选择订单类型`,
    'new-buy-order-cbbutton': '📗  我想买',
    'new-sell-order-cbbutton': '📕  我想卖',
    'input-fixed-rate': `*💸 设置{{ cryptoCurrencyCode }}价格*

在* {{ fiatCurrencyCode }} *中输入{{ cryptoCurrencyCode }}的固定价格，或输入百分比（％）来设置保证金价格

例: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 设置{{ cryptoCurrencyCode }}价格*

使用保证金价格根据市场价格设置动态价格。使用+ /  - 百分比（％）卖出高于或低于当前市场价格。

目前的市场利率: {{ marketRate }} ({{ marketRateSource }})

Example: 3% or -2%`,
    'use-margin-price-cbbutton': 'ℹ️ 保证金定价',
    'use-fixed-price-cbbutton': '⬅️ 价钱',
    'back-cbbutton': '⬅️ 背部',
    'input-amount-limits': `⚖️ *订单金额*

在* {{ fiatCurrencyCode }}中输入订单金额*

示例：1000或500-1000（最小 - 最大限制）`,
    'buy-order-created': '✅  您的购买订单已创建',
    'sell-order-created': '✅  您的卖单已创建',
    'create-error': '❗️  无法创建此订单。请稍后再试。',
    'select-payment-method': `💳  *付款方法*

Select a payment method.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': '显示更多 »'
  },

  'active-orders': {}
}
