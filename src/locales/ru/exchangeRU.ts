import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeRU = {
  home: {
    exchange: `💵  *обмен BTC-{{ fiatCurrency }}*

✅  24/7 поддержка через {{ supportBotUsername }}
🔒  Все сделки обеспечены гарантией условного депонирования..

Рыночная ставка: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'Мой Актив ({{ orderCount }})',
    'create-order-cbbutton': '📊 Создать заказ',
    'buy-cbbutton': '📉 Быстрая покупка',
    'sell-cbbutton': '📈 Быстрая продажа'
  },

  deals: {
    'no-quick-sell': `📉  *Быстрая покупка*

Нет активных заказов на покупку. Создайте новый заказ на покупку.`,
    'new-quick-sell-cbbutton': '📗 Новый заказ на покупку',
    'no-quick-buy': `📉  *Быстрая продажа*

Нет активных ордеров на продажу. Создайте новый ордер на продажу.`,
    'new-quick-buy-cbbutton': '📕 Новый заказ на продажу',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *Спор решен*

После тщательного анализа, основанного на доказательствах, представленных обеими сторонами, мы подтверждаем, что вы являетесь подлинным участником сделки.

Соответствующие меры были приняты против покупателя. Приносим извинения за возможные неудобства

Заблокированные средства были * освобождены *. Проверьте свой кошелек.`,
      'dispute-resolved-buyer-win': `👩‍🎓  *Спор решен*

После тщательного анализа, основанного на доказательствах, представленных обеими сторонами, мы подтверждаем, что вы являетесь подлинным участником сделки.

Соответствующие меры были приняты против продавца. Приносим извинения за возможные неудобства.

{{ cryptoAmount }} был * зачислен *. Проверьте свой кошелек.`,
      'dispute-resolved-seller-lose': `👩‍🎓  *Спор решен*

После тщательного анализа, основанного на доказательствах, представленных обеими сторонами, мы подтверждаем, что с вашей стороны произошла ошибка в этой сделке.

ПРИМЕЧАНИЕ: повторное нарушение приведет к постоянному бану.`,
      'dispute-resolved-buyer-lose': `‍🎓  *Спор решен*

После тщательного анализа, основанного на доказательствах, представленных обеими сторонами, мы подтверждаем, что с вашей стороны произошла ошибка в этой сделке.

ПРИМЕЧАНИЕ: повторное нарушение приведет к постоянному бану.`,
      'referral-comission': `🚀  *Комиссия получена*

Поздравляем! Вы получили комиссию {{cryptoAmount}} от своей торговли рефералами. Продолжайте приглашать.`,
      'open-dispute-cbbutton': '👩‍🎓 Открытый вопрос',
      'dispute-initiator': `*Торговая поддержка* ${
        BotCommand.TRADE
      }{{ tradeId }}

Был поднят вопрос по этой сделке. Торговля временно заблокирована. Пожалуйста, свяжитесь с @{{ legalUsername }}, чтобы решить эту проблему.`,
      'dispute-received': `*Trade support* ${BotCommand.TRADE}{{ tradeId }}

Пользователь поднял вопрос об этой сделке.

Пожалуйста, свяжитесь с @ {{ legalUsername }}, чтобы решить эту проблему.`,
      'confirm-payment-received': `*Подтверждение оплаты*

Вы уверены, что получили *{{fiatAmount}}* от покупателя?`,
      'confirm-payment-received-yes-cbbutton': 'да',
      'confirm-payment-received-no-cbbutton': 'нет',
      'payment-released-buyer': `🚀 *{{ cryptoCurrency }} зачислена* ${
        BotCommand.TRADE
      }{{ tradeId }}

На ваш кошелек начисляется * {{ cryptoAmount }} * из этой сделки.`,
      'payment-released-seller': `🚀 *Успешная торговля* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}* списана с вашего кошелька и передана покупателю.`,
      'give-rating': `🏅  *Оцените эту сделку*

Дайте свой рейтинг для этой сделки.`,
      'give-review': `🗣  *Обзор торговли*

Написать краткий обзор для этой сделки`,
      'end-review': `Отзыв добавлен.

🎉 Пригласите своих друзей, чтобы у них также был лучший опыт, вы можете использовать своего реферала, чтобы получать комиссионные с их сделок.

{{ referralLink }}`,
      'skip-review': 'Пропускать ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*Подтвердите оплату*

Вы отправили *{{ fiatAmount }}* продавцам *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'да',
      'confirm-payment-sent-no-cbbutton': 'нет',
      'payment-sent-buyer': `*🛎 Сделка* ${BotCommand.TRADE}{{ tradeId }}

Продавец был уведомлен. Пожалуйста, подождите, пока продавец подтвердит ваш платеж.

В случае, если нет подтверждения; Вы можете Поднять вопрос.`,
      'payment-sent-seller': `🛎  *Платеж подтвержден* ${
        BotCommand.TRADE
      }{{ tradeId }}

Покупатель отправил *{{ fiatAmount }}* на ваш *{{ paymentMethod }}*. Пожалуйста, подтвердите, когда вы получите платеж.

Если вы не получили платеж, вы можете *Поднять вопрос*.`,
      'escrow-warn-seller': `*Информация*

Покупатель еще должен оплатить сделку. ${BotCommand.TRADE}{{ tradeId }}.

Вы можете связаться с нашей *поддержкой*, если считаете, что что-то не так, они вам помогут.

Если в течение *{{ paymentSendTimeout }} минут* не получено подтверждение, заблокированная сумма будет вам автоматически возвращена.`,
      'escrow-warn-buyer': `*Торговое напоминание об оплате*

Вам еще предстоит оплатить сделку ${
        BotCommand.TRADE
      }{{ tradeId }}. Нажмите *Я заплатил*, если вы уже произвели оплату.

⚠️ У вас осталось * {{ paymentSendTimeout }} минут *, чтобы сделать этот платеж. Любой платеж, сделанный после этого, будет недействительным.`,
      'escrow-closed-seller': `🤷‍♂️  *Торговля закрыта*

Покупатель не оплатил и подтвердил оплату за сделку. ${
        BotCommand.TRADE
      }{{ tradeId }}.

Ваш *{{ cryptoAmount }}* был возвращен вам. По вопросам, связанным с этой торговлей, пожалуйста, свяжитесь с нашей *поддержкой*.`,
      'escrow-closed-buyer': `🤷‍♂️  *Торговля закрыта*

Вы не сделали никакой оплаты продавцу за торговлю. ${
        BotCommand.TRADE
      }{{ tradeId }}. По вопросам, связанным с этой торговлей, пожалуйста, свяжитесь с нашей *поддержкой*.`,
      'cancel-trade-confirm': `Вы уверены, что хотите отменить сделку ${
        BotCommand.TRADE
      }{{ tradeId }} on *{{ fiatAmount }}*?

⚠️ Никогда не отменяйте, если вы уже заплатили продавцу.`,
      'cancel-trade-confirm-yes-cbbutton': 'да',
      'cancel-trade-confirm-no-cbbutton': 'нет',
      'cancel-trade-success': 'Эта сделка была отменена вами.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'Сделка отменена уже или истек.',
      'cancel-trade-notify': `❗️торговля ${
        BotCommand.TRADE
      }{{ tradeId }} был отменен пользователем.`,
      'trade-rejected-notify':
        'Пользователь отменил эту сделку. Вы можете выбрать другие выгодные предложения в разделе Быстрая покупка / продажа.',
      'trade-rejected-success': 'Вы отклонили эту сделку.',
      'trade-accepted-seller-success': `🛎 *Торговля открыта* ${
        BotCommand.TRADE
      }{{ tradeId }}

Пользователь был уведомлен о внесении депозита *{{ fiatPayAmount }}* в ваше *{{ paymentMethodName }}*.

[Телеграмма контакт](tg://user?id={{ buyerUserId }})

Вы будете уведомлены, когда этот платеж будет помечен как завершенный.`,
      'trade-accepted-buyer-no-payment-info':
        'Отправить сообщение продавцу для уточнения деталей платежа.',
      'trade-accepted-buyer': `🛎  *Торговля принята* ${
        BotCommand.TRADE
      }{{ tradeId }}

Сделав платеж {{ fiatPayAmount }} через {{ paymentMethodName }}, вы получите *{{ cryptoAmount }}* после подтверждения вашего платежа.

*{{ paymentMethodName }}*
Количество: *{{ fiatPayAmount }}*
Ссылка на платеж: *T{{ tradeId }}*
{{ paymentDetails }}

[Телеграмма контакт](tg://user?id={{ buyerUserId }})

🔒 Эта сделка защищена. Оплата действительна только в течение *{{ paymentSendTimeout }} минут*.`,
      'payment-received-cbbutton': '💵  Платеж получен',
      'payment-sent-cbbutton': '💸  я заплатил',
      'trade-accepted-fail':
        '️Сожалею. При открытии этой сделки произошла ошибка.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ У вас уже есть сделка по этому заказу. Вы не можете разместить несколько сделок для одного заказа.',
        [TradeError.NOT_FOUND]: '❗️ Мы не смогли найти эту сделку.',
        [TradeError.TRADE_EXPIRED]:
          '❗️ Эта сделка недействительна или просрочена.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❗️ У вас недостаточно средств для открытия сделки.'
      },
      'init-get-confirm-buy': `🛎 *Новая Торговля* ${
        BotCommand.TRADE
      }{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} хочет купить *{{ cryptoCurrencyAmount }}* за *{{ fiatValue }}* по цене {{ fixedRate }}.

Хотите принять эту сделку?`,
      'init-get-confirm-sell': `🛎 *Новая Торговля* ${
        BotCommand.TRADE
      }{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} хочет продать *{{ cryptoCurrencyAmount }}* за *{{ fiatValue }}* по цене {{ fixedRate }}.

Хотите принять эту сделку?`,
      'trade-init-yes-cbbutton': 'да',
      'trade-init-no-cbbutton': 'нет',
      'trade-init-no-response': `💤 *Нет ответа*

Этот пользователь в настоящее время отсутствует. Пожалуйста, попробуйте другие сделки.`,
      'trade-init-expired': `⏳ *Торговля истекла*

Поскольку вы не ответили, торговый запрос ${
        BotCommand.TRADE
      }{{ tradeId }} истек и отменен.

Вы можете легко приостановить заказ, если вас нет. Это гарантирует хороший опыт для других трейдеров.`
    },
    'request-deposit-notify': `🛎  *Новый запрос на покупку*

У вас есть новый запрос на покупку вашего заказа ${BotCommand.ORDER}{{orderId}}.

*{{ requesterName}}* хочет купить *{{ formattedCryptoValue }}* за *{{ formattedFiatValue }}*.

[Телеграмма контакт](tg://user?id={{ requesterUserId }})

⚠️ Вам необходимо внести необходимые средства, прежде чем вы сможете начать эту торговлю.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Заказ не найден.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'Вы не можете открыть сделку по собственному заказу!',
      default: 'Сожалею. Произошла ошибка. Пожалуйста, попробуйте позже.'
    },
    'next-cbbutton': 'следующий',
    'prev-cbbutton': 'предыдущая',
    'show-buy-deals': `📉 *Быстрая покупка* ({{ currentPage}}/{{ totalPages }})

Пожалуйста, выберите заказ, который вы хотите купить.

Цена / {{cryptoCurrencyCode}}, способ оплаты и рейтинг трейдера показаны.
`,
    'show-sell-deals': `📈 *Быстрая продажа* ({{ currentPage}}/{{ totalPages }})

Выберите заказ, который хотите продать.

*Цена / {{cryptoCurrencyCode}}*, *Способ оплаты* и *Рейтинг покупателя* отображаются.
`,
    'id-verified': 'Проверка: ✅ KYC проверено',
    'show-buy-deal': `📉 *купить {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

Эта сделка * {{ realName }} *.
{{ verificationText }}
Идентификатор аккаунта: ${BotCommand.ACCOUNT}{{ accountId }}
Рейтинг:  {{ rating }} ⭐️

*Детали платежа*:
-----------------
Способ оплаты: {{ paymentMethodName }}
термины: _{{ terms }}_

*Детали сделки*:
----------------
Цена: {{ rate }} / {{ cryptoCurrencyCode }}
Сумма покупки: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *продавать {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

Этот заказ на продажу *{{ realName }}*.
{{ verificationText }}
идентификатор аккаунта: ${BotCommand.ACCOUNT}{{ accountId }}
Рейтинг:  {{ rating }} ⭐️

*Детали платежа*:
-----------------
Способ оплаты: {{ paymentMethodName }}
термины: _{{ terms }}_

*Детали сделки*:
----------------
Цена: {{ rate }} / {{ cryptoCurrencyCode }}
Продать сумму: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `На счете трейдера недостаточно средств для начала сделки. Попросите продавца внести средства, после чего сделка может начаться.`,
    'request-buy-deal-deposit-cbbutton': '📲 Связаться с продавцом',

    'open-buy-deal-cbbutton': '🛎 Купить {{ cryptoCurrencyCode }} здесь',
    'open-sell-deal-cbbutton': '🛎 Продайте {{ cryptoCurrencyCode }} отсюда',
    'back-cbbutton': '⬅️ назад',
    'user-reviews': '💬 Отзывы Пользователей',
    'input-buy-amount': `💵  *Введите сумму покупки*

Введите сумму {{ fiatCurrencyCode }} между * {{ minFiatValue }} * и * {{ maxFiatValue }} *.

Например: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵  *Введите сумму продажи*

Введите сумму {{ fiatCurrencyCode }} между *{{ minFiatValue }}* и *{{ maxFiatValue }}*.

For example: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*детали платежа*

Выберите или добавьте новые реквизиты для *{{ paymentMethodType }}*, чтобы покупатель отправил вам деньги.`,
    'skip-input-payment-details': 'пропускать',
    'add-payment-details': '➕ добавлять {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*Откройте эту сделку?*

Вы действительно хотите купить * {{ cryptoValue }} * за * {{ fiatValue }} * по цене {{ rate }}?

❕ Нажимая *'Да'*, вы соглашаетесь с условиями торговли.`,

    'confirm-input-sell-amount': `*Откройте эту сделку?*

Вы уверены, что хотите продать * {{ cryptoValue }} * за * {{ fiatValue }} * по цене * {{ rate }} *?

❕ Нажимая *'Да'*, вы соглашаетесь с условиями торговли.`,
    'confirm-input-amount-yes-cbbutton': 'да',
    'confirm-input-amount-no-cbbutton': 'нет',
    'show-open-deal-request': `📲 *Запрос отправлен!*

Ваш запрос был отправлен, эта сделка начнется только после того, как продавец внесет необходимые средства.

⚠️ ВАЖНО: Никогда не производите оплату, пока депозит не был подтвержден здесь. Не заключайте сделок за пределами MegaDeals, вы рискуете потерять свои деньги.

*Контакт телеграммы продавца*: [Telegram contact](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'Сделка отменена.',
    'trade-opened-message': 'Торговля сейчас активна!',
    'show-opened-trade': `*Сделка* ${BotCommand.TRADE}{{ tradeId }}

В ожидании ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. Если пользователь не подтвердит начало сделки в течение {{ timeoutMinutes }} минут, сделка будет автоматически отменена.
⚠️ ВАЖНО! В целях безопасности не совершайте никаких сделок за пределами MegaDeals.

Никогда не отменяйте транзакцию, если вы уже произвели оплату.

*Автоматическая отмена через * {{ timeoutMinutes }} минут*`,
    'cancel-trade-cbbutton': '🚫 Отменить торговлю'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'Продать заказ @ {{ rate }}',
    'my-buy-order-cbbutton': 'Купить заказ @ {{ rate }}',
    'buy-deal-cbbutton': '🛎 Купить торговлю - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎 Продать торговлю - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 депозит {{ cryptoCurrencyCode }}',
    'show-active-orders': `*Активные заказы*

Ваши текущие сделки и ордера, созданные вами, перечислены.
`,
    'order-enabled': 'Ваш заказ активен сейчас.',
    'input-payment-details-field': `Напишите свой *{{ fieldName }}* для *{{ paymentMethod }}*`,
    'order-disabled': `Ваш заказ установлен как неактивный.
Нажмите кнопку *'Active'*, чтобы включить этот порядок.`,
    'show-orders': 'TODO: Показать мои заказы',

    'terms-not-added': 'Никто',
    'my-buy-order-info': `📗  *Мой заказ на покупку* - ${
      BotCommand.ORDER
    }{{orderId}}

*Статус*: {{ status }}
*{{ cryptoCurrencyCode }} Цена*: {{ rate }}
*Минимум количество*: {{ minAmount }}
*Максимум. количество*: {{ maxAmount }}
*Способ оплаты*: {{ paymentMethod }}

термины: _{{ terms }}_

*Ссылка для заказа*: {{ orderLink }}
Поделитесь этой ссылкой. Кто бы ни щелкнул по этой ссылке, он может открыть сделку с вами.
`,
    'payment-info-not-added': 'Не добавлено',
    'insufficient-sell-order-balance':
      '⚠️ Недостаточный баланс. Внесите минимальную сумму, чтобы начать сделки по этому заказу.',
    'my-sell-order-info': `*📕 Мой ордер на продажу* - ${
      BotCommand.ORDER
    }{{orderId}}

*Статус*: {{ status }}
*{{cryptoCurrencyCode}} цена*: {{ rate }}
*Минимум количество*: {{ minAmount }}
*Максимум. количество*: {{ maxAmount }}
*Способ оплаты*: {{ paymentMethod }}
*Платежная информация*: {{ paymentInfo }}

термины: _"{{ terms }}"_

*порядок ссылка на сайт*: {{ orderLink }}
Поделитесь этой ссылкой и откройте сделку напрямую с другими трейдерами.
`,
    'edit-amount-cbbutton': '⚖️ Количество',
    'edit-rate-cbbutton': '💸 BTC цена',
    'edit-terms-cbbutton': '📝 термины',
    'edit-payment-method-cbbutton': '💳 Способ оплаты',
    'toggle-active-cbbutton': 'активный',
    'delete-order-cbbutton': '🗑️ удалять!',
    'edit-order': '✏️ Редактировать заказ',
    'go-back-cbbutton': '⬅️ назад',
    'order-edit-success': '✅ Ваш заказ обновлен.',
    'edit-payment-details': '📃 Обновить информацию об оплате',
    'order-edit-rate': `*Установить {{cryptoCurrencyCode}} цену*

Введите фиксированную цену для {{cryptoCurrencyCode}} в * {{fiatCurrencyCode}} * или введите в процентах (%), чтобы установить маржинальную цену.

пример: *{{ marketRate }}* or *2%*`,
    'order-edit-terms': `📋 *термины*

Напишите свои условия для торговли. Это будет показано в вашем заказе.`,
    'order-delete-success': 'Заказ удален'
  },

  'create-order': {
    show: `📝 *Создать заказ*

Выберите тип заказа.`,
    'new-buy-order-cbbutton': '📗  я хочу купить',
    'new-sell-order-cbbutton': '📕  я хочу продать',
    'input-fixed-rate': `*💸 Установить {{cryptoCurrencyCode}} цену*

Введите фиксированную цену для {{cryptoCurrencyCode}} в * {{fiatCurrencyCode}} * или введите в процентах (%), чтобы установить маржинальную цену.

пример: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 Установить {{cryptoCurrencyCode}} цену*

Используйте маржинальную цену, чтобы установить динамическую цену, основанную на рыночных ставках. Используйте + / - процент (%), чтобы продавать выше или ниже текущей рыночной ставки.

Текущий рыночный курс: {{ marketRate }} ({{ marketRateSource }})

пример: 3% or -2%`,
    'use-margin-price-cbbutton': 'ℹ️ Маржинальные цены',
    'use-fixed-price-cbbutton': '⬅️ Цена',
    'back-cbbutton': '⬅️ назад',
    'input-amount-limits': `⚖️ *Сумма заказа*

Введите сумму заказа в * {{fiatCurrencyCode}} *.

Пример: 1000 или 500-1000 (мин. Макс. Предел)`,
    'buy-order-created': '✅  Ваш заказ на покупку создан.',
    'sell-order-created': '✅  Ваш заказ на продажу создан.',
    'create-error':
      '❗️  Не удалось создать этот заказ. Пожалуйста, попробуйте позже.',
    'select-payment-method': `💳  *Способ оплаты*

Выберите метод оплаты.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'показать больше »'
  },

  'active-orders': {}
}
