import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonRU = {
  group: {
    'limit-updated': 'обновленный лимит!',
    unauthorized: 'Только администраторы чата могут использовать эту команду.',
    'invalid-limit-number':
      'Значение для setDailyLimit должно быть между 0-24.',
    'special-message': `❕ Вы можете добавить этого бота в свои группы или каналы и зарабатывать BTC прямо сейчас.
[Нажми сюда, чтобы прочитать больше](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*Привет*

Я начну отправлять уведомления о ставках BTC здесь.

*Commands*
[/rate - Получить текущий рыночный курс для BTC]
[/setDailyLimit 6] - Установите количество уведомлений о скорости, отправляемых за день. Значение должно быть 0 - 24. (Доступно только для администраторов)`,
    'account-linked': `❕Этот бот связан с [{{ telegramName }}](tg://user?id={{ telegramUserId }})'s аккаунт на @{{ botUsername }}.`,
    'account-not-linked':
      '❕Нет аккаунта, связанного с этой группой. [{{ telegramName }}](tg://user?id={{ telegramUserId }}) можете написать мне на @{{ botUsername }} или нажмите кнопку ниже, чтобы создать и связать учетную запись.',
    'exchange-btc': '📊 Купить / продать BTC',
    'rate-alert-up': `*Оценить оповещение*

🚀 BTC увеличился *{{ change1h }%* за последний час в *{{ formattedRate }}*.

----------------
24h объем: {{ formattedVolume24h }}
24h менять: {{ change24h }}%
7d менять: {{ change7d }}%
----------------`,
    'rate-alert-down': `*Оценить оповещение*

🎢 BTC не работает *{{ change1h }}%* за последний час в *{{ formattedRate }}*.

----------------
24h объем: {{ formattedVolume24h }}
24h менять: {{ change24h }}%
7d менять: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *MegaX*

_Быстрый и простой способ обмена биткойнов локально в вашей валюте._
https://megax.in

*Статус*: Online
*Снять комиссии*: {{ btcWithdrawalFee }}
*Мин снятие*: {{ btcWithdrawalMin }}
*Такер плата*: {{ takerFeePercentage }}% (Плата за быстрые покупки / быстрые продажи сделок)
*производителя Плата*: {{ makerFeePercentage }}%
*Реферальная комиссия*: {{ referralComission }}% от общего торгового сбора.`,
    'join-group-cbbutton': '📣 MegaX канал объявления',
    'referral-cbbutton': '🤝 Пригласить реферала',
    'verify-account-cbbutton': '🆔 Проверьте KYC',
    'guide-cbbutton': '📖 Как пользоваться?',
    'support-cbbutton': '👨‍💼 Служба поддержки'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 *Сообщение от администратора*',
    'support-message-title': '👩‍💼 *Сообщение от поддержки*',
    'system-message-title': '🤖 *Системное сообщение*'
  },
  'new-referral': `🤝 *Новый реферал*,

${
    BotCommand.ACCOUNT
  }{{ accountId }} присоединился через вашу реферальную ссылку.

Теперь вы будете получать комиссионные со всех своих сделок.`,
  'callback-error-response': '❗️ ошибка',
  'contact-legal-cbbutton': '👩‍🎓 Контактная поддержка',
  'contact-legal': `👩‍🎓 *Служба поддержки*

Contact for issues related to your trade or any disputes with your trades/orders (include your trade id or other information to resolve your issue quickly).

Отправить сообщение: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 Контактная поддержка',
  'contact-support': `👨‍💼 *Служба поддержки*

Если вам нужна поддержка, связанная с услугой. Вы можете сообщать о любых проблемах, ошибках или отзывах, связанных с сервисом.

Отправить сообщение: @{{ supportUsername }}
`,
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.KRAKEN]: 'Kraken'
  },
  updated: 'обновленный!',
  'cryptocurrency-names': {
    BTC: 'Bitcoin'
  },
  cancel: 'cancel',
  actions: {
    'cancel-keyboard-button': 'отменить',
    'back-inline-button': '« назад',
    'more-inline-button': 'Больше'
  },
  'action-canceled': 'Это действие было отменено.',
  error: {
    unknown:
      '❗️❗️ К сожалению! Произошла ошибка. Мы работаем над этим. Пожалуйста, попробуйте позже.',
    'bad-message': `👮‍ *MegaDeals Команда поддержки:*

Если у вас возникли проблемы, мы готовы помочь вам 24/7. Свяжитесь с нашей командой @{{ supportBotUsername }}

⚠️ ВАЖНО: Никогда не заключайте сделок вне этого бота, мы не сможем защитить и вернуть ваши средства.

ℹ️  *Около MegaDeals:*

MegaDeals - это безопасный p2p-биржа для покупки / продажи биткойнов в местной валюте. `
  },
  bot: {
    name: 'BTC Deals',
    support: {
      name: 'BTC Deals поддержка'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: 'купить',
      [OrderType.SELL]: 'продавать'
    }
  },
  'main-menu': {
    exchange: '💵 обмен BTC-{{ fiatCurrency }}',
    account: '👤 Мой аккаунт',
    wallet: '💼 Бумажник',
    info: '🔷 Информация'
  },
  'unhandled-callback': `Сожалею! Ваш сеанс по этому запросу истек. Пожалуйста, сделайте новый запрос еще раз.`,
  'payment-methods': {
    names: {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS bank transfer',
      // RUB
      [PaymentMethodType.SBERBANK]: 'сбербанк',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChat',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'National Bank Transfer',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Cash trade',
      [PaymentMethodType.CASH_DEPOSIT]: 'Cash deposit',
      [PaymentMethodType.CREDIT_CARD]: 'Credit card',
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
      [PaymentMethodType.OTHER]: 'Other'
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
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: 'National Bank Transfer',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Cash trade',
      [PaymentMethodType.CASH_DEPOSIT]: 'Cash deposit',
      [PaymentMethodType.CREDIT_CARD]: 'Credit card',
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
      [PaymentMethodType.OTHER]: 'Other'
    },
    fields: {
      [PaymentMethodType.PAYTM]: {
        field1: 'Мобильный номер'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI идентичность'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: 'название банка',
        field2: 'Номер счета',
        field3: 'Код IFSC'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: 'Полные реквизиты для оплаты'
      },
      [PaymentMethodType.QIWI]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.WECHAT]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: 'название банка',
        field2: 'Детали учетной записи'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: 'Эл. адрес'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: 'Расположение / город'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.SKRILL]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.OKPAY]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.PAXUM]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: 'детали платежа'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Название тикера Altcoin',
        field2: 'Адрес альткойн'
      },
      [PaymentMethodType.OTHER]: {
        field1: 'Полная информация об оплате'
      }
    }
  },
  'show-transactions-title': `📗 *операции*

*CoiМонетаn*        *Количество*               *Тип*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
