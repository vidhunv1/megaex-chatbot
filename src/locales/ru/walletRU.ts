import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletRU = {
  /* Home */
  home: {
    wallet: `💼  *BTC Бумажник*

 Остаток средств:    {{ cryptoBalance }}
     Значение:    {{ fiatBalance }}
 блокированный:    {{ blockedBalance }}

   приглашенный:    {{ referralCount }} пользователи
        прибыль:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ послать',
    'my-address': '📩  депозит',
    withdraw: '📤  Изымать',
    'transaction-credit': 'кредит',
    'transaction-debit': 'Дебет'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *депозит {{ cryptoCurrencyCode }}*

Средства будут доступны в вашем кошельке после {{ confirmations }} подтверждения сети. Используйте адрес {{ cryptoCurrencyCode }} ниже, чтобы внести средства в свой кошелек.

ПРИМЕЧАНИЕ: * Внесите только {{cryptoCurrencyCode}} средства * на этот адрес.`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *Сумма для отправки*

Введите сумму в *{{ cryptoCurrencyCode }}* или *{{ fiatCurrencyCode }}*.

пример: {{ cryptoCurrencyBalance }}

Имеется в наличии: {{ cryptoCurrencyBalance }}
    Значение: {{ fiatValue }}`,
    confirm: `👁‍🗨*подтвердить*

Это правильно? Если да, нажмите * «Подтвердить» *.:

Количество: {{ cryptoCurrencyAmount }}
 Значение:  {{ fiatValue }})
`,
    'confirm-button': '✔️  подтвердить',
    'insufficient-balance': `❗️  *Недостаточно средств*

Добавьте {{cryptoCurrencyCode}} в свой кошелек, чтобы отправить этот платеж.

*Доступные средства*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❗️  *Неверная сумма*

Введите действительную сумму.`,
    'error-creating-payment':
      'При создании этого платежа произошла ошибка. Повторите попытку позже.',
    'show-created-link': `✅  *Проверка создана*

{{ paymentLink }}
Поделитесь этой ссылкой в ​​частном порядке. Любой, кто имеет доступ к этой ссылке, получит средства.

Срок действия этой ссылки истекает через * {{expiryTime}} часов *.`,
    'payment-link-expired':
      'Срок действия платежной ссылки, созданной вами из * {{cryptoValue}} *, истек.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'Эта ссылка для оплаты была востребована.',
      [TransferErrorType.EXPIRED]:
        'Срок действия этой ссылки для оплаты истек.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `В аккаунте пользователей недостаточно средств для этого платежа, вы можете связаться с ним, чтобы пополнить свой счет, чтобы повторить этот платеж.

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'Ссылка на платеж недействительна.',
      [TransferErrorType.SELF_CLAIM]: `✅  *Ссылка на оплату*

Количество: *{{ cryptoValue }}*
Поделитесь ссылкой в ​​частном порядке, чтобы отправить средства. Любой, кто имеет доступ к этой ссылке, получит средства.
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'Произошла ошибка. Пожалуйста, попробуйте позже.'
    },
    'payment-success': {
      receiver: `✅ *Новый Кредит*

Вы получили * {{cryptoValueReceived}} * от [{{ senderName }}](tg://user?id={{ senderTelgramId }}).`,
      sender: `✅ *Новый Дебет*

[{{ receiverName }}](tg://user?id={{ receiverTelegramId }}) получил * {{cryptoValueSent}} * от вашей платежной ссылки.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*Снять BTC*

Введите сумму в * {{cryptoCurrencyCode}} * для вывода.
пример: 0.018291 BTC

Имеется в наличии: {{ cryptoCurrencyBalance }}
Значение: {{ fiatValue }}`,
    'input-address': `*BTC адрес*

Введите адрес кошелька {{cryptoCurrencyName}}, на который вы хотите вывести деньги.
`,
    'insufficient-balance': `❗️ *Недостаточно средств*

Средства в кошельке слишком малы. Добавьте средства и попробуйте еще раз.

*Available balance*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *Неверный адрес*

Проверьте адрес *{{ cryptoCurrencyName }}* и попробуйте снова.
`,
    'less-than-min-error': `❗️ Минимальная сумма вывода составляет * {{minWithdrawAmount}} *.
`,
    'create-error': `Произошла ошибка.

Пожалуйста, попробуйте позже. Если проблема не устранена, обратитесь в службу поддержки @ {{supportUsername}}`,
    confirm: `👁‍🗨  *Проверьте детали*

     Адрес: {{ toAddress }}
Количество: {{ cryptoCurrencyAmount }}
  Значение: {{ fiatValue }})
`,
    'confirm-button': '✔️ подтвердить',
    'create-success': `⏳ *Обработка вывода ...*

Ваш запрос на вывод средств находится в очереди. Вы получите уведомление, когда оно будет обработано.

Будет использована плата за сеть в размере *{{ feeValue }}*.`,
    'withdraw-processed': `✅ *Вывод средств завершен*

Ваш вывод *{{ cryptoCurrencyAmount }}* выполнен.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *вступающий {{ cryptoCurrencyCode }}*

У вас есть новый депозит *{{ cryptoCurrencyValue }}*. Будет добавлено после {{ requiredConfirmation }} подтверждение в сети.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  *{{ cryptoCurrencyCode }} получено*

*{{ cryptoCurrencyValue }}* добавлено в кошелек.`,
    'source-name': {
      core: 'депозит',
      payment: 'оплата',
      withdrawal: 'изымать',
      release: 'релиз',
      block: 'блок',
      trade: 'сделка',
      comission: 'комиссионной',
      fees: 'сборы'
    }
  }
}
