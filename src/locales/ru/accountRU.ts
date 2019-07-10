import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountRU = {
  home: {
    'passport-data-received': `✅ *Идентификатор получен*

Ваши проверочные документы были получены. Это должно быть обработано в течение 3 рабочих часов. Мы сообщим вам, когда он будет обработан.`,
    'trade-message': `Посмотреть торговлю ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 Напиши сообщение',
    'send-response-cbbutton': '📝 Написать отзыв',
    'message-sent': 'Сообщение отправлено!',
    'new-photo-message': `📨 <b>Сообщение от</b> ${
      BotCommand.ACCOUNT
    }{{ accountId }}
{{ tradeInfo }}
Получил фото`,
    'message-not-sent': '❗️ Не удалось отправить.',
    'enter-message': 'Введите сообщение для пользователя. (макс. 400 символов)',
    'new-message': `📨 <b>Сообщение от</b> ${BotCommand.ACCOUNT}{{ accountId }}

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ назад',
    'more-cbbutton': 'Больше »',
    'no-reviews-available': 'Отзывов пока нет.',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *Обзор для* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

* {{ reviewerName }} *. Торгуется за {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'Не удалось найти этот аккаунт.'
    },
    account: `👤  *Мой аккаунт*

Account ID: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *Всего сделок:* {{ dealCount }}
💎 объем: {{ tradeVolume }}
⭐ Рейтинг: {{ rating }}

🤝 Приглашенные рефералы: {{ referralCount }}
💰 Доход от рефералов: {{ earnings }}

💳 *Способы оплаты:* {{ paymentMethods }}`,

    'dealer-account': `*Детали учетной записи* (${
      BotCommand.ACCOUNT
    }{{ accountId }})

[Телеграмма контакт](tg://user?id={{ telegramUserId }})

💵 Торговые предложения: {{ dealCount }}
💎 Объем торгов: {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ Рейтинг: {{ rating }}`,

    'user-reviews-cbbutton': '🗣 Отзывы ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️ Блокировать пользователя',
    'unblock-dealer-cbbutton': 'Разблокировать пользователя',
    'verify-account-cbbutton': '🆔 Проверьте',
    'manage-payment-methods-cbbutton': '💳 Способы оплаты',
    'referral-link-cbbutton': '🤝 Направления',
    'settings-cbbutton': '️⚙️ настройки',
    'no-payment-method': `не добавлено`
  },

  'payment-method': {
    'does-not-exist': `❗️  *Неверный способ оплаты*

Этот способ оплаты не существует.

Вы можете запросить @ {{ supportBotUsername }} для добавления действительного метода оплаты.`,

    'create-error':
      'Сожалею. Мы не смогли создать этот способ оплаты. Пожалуйста, попробуйте позже.',
    'edit-cbbutton': '🖋  Изменить способы оплаты',
    'add-cbbutton': '➕  Добавить способ оплаты',
    'show-all': `💳 *Способы оплаты*

{{ paymentMethodsList }}`,
    'show-edit': `*Изменить способ оплаты*

Нажмите на способ оплаты, который вы хотите изменить.`,
    'select-to-add': `*Выбрать*

Выберите способ оплаты, чтобы добавить из вариантов ниже.`,
    'edit-enter-field': 'Введите *{{ fieldName }}*',
    created: `✅ Способ оплаты *добавлено*

Ваш способ оплаты добавлен.

{{ paymentMethodInfo }}
Теперь вы можете использовать это для получения денег при продаже {{ cryptoCurrencyCode }}.`,
    updated: `✅ *Способ оплаты обновлен*

Ваш способ оплаты обновлен.

{{ paymentMethodInfo }}`,
    'none-added': `Способы оплаты не добавлены. Они используются для перевода денег вам, когда вы продаете.`
  },

  referral: {
    'show-info': `🤝  *Обращайтесь и зарабатывайте*

Ваш реферал: {{ referralCount }} люди
Реферальные сборы: {{ referralFeesPercentage }}%

Зарабатывайте биткойны с каждой сделкой вашего реферала. Вы получите {{ referralFeesPercentage }}% комиссии за сделку.

Например: если ваш реферал торгует на 1 BTC, вы получите 0.004 BTC из 0.008 BTC, которые мы берем в качестве комиссии.

Обрабатывается и зачисляется мгновенно на ваш кошелек. Нет ограничений и нет срока действия.

Скопируйте сообщение ниже и поделитесь им. 👇`
  },

  settings: {
    'invalid-username': `❌ *ошибка*

Этот идентификатор учетной записи недействителен. Пожалуйста, проверьте введенный вами идентификатор и повторите попытку.`,

    'update-success': 'изменено',
    'username-show': `👤 *Введите идентификатор учетной записи*

Только английские буквы и цифры от 3 до 15 символов.

ПРИМЕЧАНИЕ: это действие является окончательным, вы не сможете изменить свой идентификатор учетной записи снова.
`,
    'back-to-settings-cbbutton': '⬅️ назад',
    'settings-currency-updated': `Ваша валюта обновлена ​​до *{{ updatedCurrencyCode }}*.`,
    'show-rate-source': `📊 *Оценить источник*

Выберите источник обменного курса, который вы хотите использовать.
В настоящее время активен: *{{ exchangeSource }}*.

Примечание. Изменение этого параметра повлияет на ваши активные заказы, если вы использовали маржинальную оценку.
`,
    'show-more': 'Больше »',
    'show-currency': `💵 *валюта*

Нажмите, чтобы изменить вашу валюту.

В настоящее время вы используете *{{ fiatCurrencyCode }}*. Выберите валюту. Нажмите подробнее, чтобы увидеть другие доступные валюты.`,
    'show-language': `🌎 *язык*

Выберите язык для приложения.

Примечание. Старые сообщения (отправленные и полученные) не будут изменены на новый язык.

В настоящее время активен: *{{ language }}*`,
    'currency-cbbutton': '💵 валюта',
    'language-cbbutton': '🌎 язык',
    'rate-source-cbbutton': '📊 Оценить источник',
    'show-settings': `⚙️ настройки

Что вы хотите редактировать?`,
    'username-cbbutton': '👤  Изменить идентификатор аккаунта'
  }
}
