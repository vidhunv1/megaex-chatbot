import { BotCommand } from 'chats/types'

export const signupZH = {
  'choose-language': `Hello!

You can use this bot to exchange bitcoins locally in your currency.

To get started, choose your *language* from options below.`,

  'terms-and-conditions': `阅读我们的[服务条款](https://telegra.ph/Terms-of-Service-06-18), 继续点击 ✔️*我同意*`,

  'terms-agree-button': '✔️ 我同意',

  'select-currency': '选择您的本地货币',

  'account-ready': `✅  *帐户已创建!*

帐户 ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC 地址: *{{ bitcoinAddress }}*

🔐 为了您的安全，请在设置 > 隐私和安全性中启用两步验证`,

  'account-ready-generating-address': `✅  *帐户已创建!*

帐户 ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC 地址: *{{ bitcoinAddress }}*

🔐 为了您的安全，请在设置 > 隐私和安全性中启用两步验证`,
  'account-ready-continue-button': '🚀 开始交易',
  'home-screen': `🔷  *Megadeals*

使用 *交换* 寻找交易或 *钱包* 撤回或存入BTC`,
  'signup-error':
    '抱歉!注册时发生错误。联系我们 @{{ supportBotUsername }} 全天候支持'
}
