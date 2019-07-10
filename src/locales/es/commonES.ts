import { PaymentMethodType } from 'models/PaymentMethod'
import { ExchangeSource } from 'constants/exchangeSource'
import { OrderType } from 'models/Order'
import { BotCommand } from 'chats/types'

export const commonES = {
  group: {
    'limit-updated': 'límite actualizado!',
    unauthorized: 'Solo los administradores de chat pueden usar este comando.',
    'invalid-limit-number':
      'El valor para setDailyLimit debe estar entre 0-24.',
    'special-message': `❕ Puedes agregar este bot a tus grupos o canales y ganar BTC ahora.
[Haga clic aquí para leer más](https://telegra.ph/Megadeals-crypto-alerts-07-03).`,
    welcome: `*Hola*

Comenzaré a enviar alertas de tarifas BTC aquí.

*Commands*
[/rate - Obtenga la tasa de mercado actual para BTC]
[/setDailyLimit 6] - Establezca el número de alertas de tarifas para enviar por día. El valor debe ser 0 - 24. (Solo disponible para administradores)`,
    'account-linked': `❕Este bot está vinculado a [{{ telegramName }}](tg://user?id={{ telegramUserId }})'s cuenta en @{{ botUsername }}.`,
    'account-not-linked':
      'No hay una cuenta vinculada a este grupo. [{{ telegramName }}] (tg://user?id ={{ telegramUserId }}) puede enviarme un PM a @{{ botUsername }} o hacer clic en el botón de abajo para crear y vincular una cuenta.',
    'exchange-btc': '📊 Compra / Venta BTC',
    'rate-alert-up': `*Alerta de tarifas*

🚀 BTC está arriba *{{ change1h }}%* en la última hora en *{{ formattedRate }}*.

----------------
24h volumen: {{ formattedVolume24h }}
24h cambio: {{ change24h }}%
7d cambio: {{ change7d }}%
----------------`,
    'rate-alert-down': `*Alerta de tarifas*

🎢 BTC está inactivo *{{ change1h }}%* en la última hora en *{{ formattedRate }}*.

----------------
24h volumen: {{ formattedVolume24h }}
24h cambio: {{ change24h }}%
7d cambio: {{ change7d }}%
----------------`
  },
  info: {
    home: `🔷 *Megadeals*

_La forma rápida y sencilla de intercambiar bitcoins localmente en tu moneda._
https://megadeals.io

*Estado*: Online
*Retiro de BTC*: {{ btcWithdrawalFee }}
*Cuota de tomador*: {{ takerFeePercentage }}% (Fee for quick buy / quick sell trades)
*Cuota de fabricante*: {{ makerFeePercentage }}%
*Comisión de referencia*: {{ referralComission }}% del canon total.`,
    'join-group-cbbutton': '👥 Únete a nuestra comunidad',
    'referral-cbbutton': '🤝 Invitar a la referencia',
    'verify-account-cbbutton': '🆔 Verificar KYC',
    'guide-cbbutton': '📖 Cómo utilizar?',
    'support-cbbutton': '👨‍💼 Apoyo'
  },
  notifications: {
    'admin-message-title': '👨‍🚀 *Mensaje del administrador*',
    'support-message-title': '👩‍💼 *Mensaje de apoyo*',
    'system-message-title': '🤖 *Mensaje del sistema*'
  },
  'new-referral': `🤝 *Nueva referencia*,

${BotCommand.ACCOUNT}{{ accountId }} unido a través de su enlace de referencia.

Ahora recibirás comisiones de todas sus operaciones..`,
  'callback-error-response': '❗️ Error',
  'contact-legal-cbbutton': '👩‍🎓 Soporte de contacto',
  'contact-legal': `👩‍🎓 *Atención al cliente*

Póngase en contacto con las cuestiones relacionadas con su comercio o cualquier disputa con sus operaciones / pedidos (incluya su identificación comercial u otra información para resolver su problema rápidamente).

Enviar mensaje: @{{ legalUsername }}`,
  'contact-support-cbbutton': '👨‍💼 Soporte de contacto',
  'contact-support': `👨‍💼 *Atención al cliente*

Si necesita soporte relacionado con el servicio. Puede informar cualquier problema, error o comentario relacionado con el servicio.

Enviar mensaje: @{{ supportUsername }}
`,
  'exchange-source': {
    [ExchangeSource.BINANCE]: 'Binance',
    [ExchangeSource.LBC]: 'LocalBitcoins',
    [ExchangeSource.COINBASE]: 'Coinbase',
    [ExchangeSource.KRAKEN]: 'Kraken'
  },
  updated: 'Actualizada!',
  'cryptocurrency-names': {
    BTC: 'Bitcoin'
  },
  cancel: 'cancelar',
  actions: {
    'cancel-keyboard-button': 'cancelar',
    'back-inline-button': '« atrás',
    'more-inline-button': 'Más'
  },
  'action-canceled': 'Esta acción fue cancelada.',
  error: {
    unknown:
      '❗️❗️ Uy! Ocurrió un error. Estamos trabajando en esto. Por favor, inténtelo de nuevo más tarde.',
    'bad-message': `👮‍ *Equipo de soporte de MegaDeals:*

Si tiene algún problema, estamos para ayudarlo 24/7. Póngase en contacto con nuestro equipo @{{ supportBotUsername }}

⚠️ IMPORTANTE: Nunca haga tratos fuera de este bot, no podremos proteger y recuperar sus fondos.

ℹ️  *Acerca de Megadeals:*

Megadeals es un robot de intercambio p2p seguro para comprar / vender bitcoins con su moneda local. `
  },
  bot: {
    name: 'BTC Deals',
    support: {
      name: 'Soporte de BTC Deals'
    }
  },
  order: {
    'type-names': {
      [OrderType.BUY]: 'Comprar',
      [OrderType.SELL]: 'Vender'
    }
  },
  'main-menu': {
    exchange: '💵 Intercambiar BTC-{{ fiatCurrency }}',
    account: '👤 Mi cuenta',
    wallet: '💼 Billetera',
    info: '🔷 Información'
  },
  'unhandled-callback': `Lo siento! Su sesión en esta solicitud ha caducado. Por favor, haga una nueva solicitud de nuevo.`,
  'payment-methods': {
    names: {
      [PaymentMethodType.PAYTM]: 'PayTM',
      [PaymentMethodType.UPI]: 'UPI',
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: 'IMPS bank transfer',
      // RUB
      [PaymentMethodType.SBERBANK]: 'SberBank',
      [PaymentMethodType.QIWI]: 'QIWI',
      [PaymentMethodType.YANDEX_MONEY]: 'Yandex Money',

      // CNY
      [PaymentMethodType.ALIPAY]: 'AliPay',
      [PaymentMethodType.WECHAT]: 'WeChay',

      // ALL
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]:
        'Transferencia bancaria nacional',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Comercio de efectivo',
      [PaymentMethodType.CASH_DEPOSIT]: 'Depósito en efectiv',
      [PaymentMethodType.CREDIT_CARD]: 'Tarjeta de crédito',
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
      [PaymentMethodType.OTHER]: 'Otra'
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
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]:
        'Transferencia bancaria nacional',
      [PaymentMethodType.PAYPAL]: 'PayPal',
      [PaymentMethodType.CASH_TRADE]: 'Comercio de efectivo',
      [PaymentMethodType.CASH_DEPOSIT]: 'Depósito en efectivo',
      [PaymentMethodType.CREDIT_CARD]: 'Tarjeta de crédito',
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
      [PaymentMethodType.OTHER]: 'Otra'
    },
    fields: {
      [PaymentMethodType.PAYTM]: {
        field1: 'Número de teléfono móvil'
      },
      [PaymentMethodType.UPI]: {
        field1: 'UPI ID'
      },
      [PaymentMethodType.BANK_TRANSFER_IMPS_INR]: {
        field1: 'Nombre del banco',
        field2: 'Número de cuenta',
        field3: 'Código IFSC'
      },

      [PaymentMethodType.SBERBANK]: {
        field1: 'Detalles completos de pago'
      },
      [PaymentMethodType.QIWI]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.YANDEX_MONEY]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.ALIPAY]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.WECHAT]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.NATIONAL_BANK_TRANSFER]: {
        field1: 'Nombre del banco',
        field2: 'Detalles de la cuenta'
      },
      [PaymentMethodType.PAYPAL]: {
        field1: 'Email'
      },
      [PaymentMethodType.CASH_TRADE]: {
        field1: 'Ubicación / ciudad'
      },
      [PaymentMethodType.CASH_DEPOSIT]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.CREDIT_CARD]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.SKRILL]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.OKPAY]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.WESTERN_UNION]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.WEBMONEY]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.NETTELLER]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.INTERNATIONAL_WIRE]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.AMAZON_GIFT_CARD]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.PAXUM]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.PAYONEER]: {
        field1: 'Detalles del pago'
      },
      [PaymentMethodType.OTHER_CRYPTOCURRENCY]: {
        field1: 'Nombre de pizarra Altcoin',
        field2: 'Dirección de altcoin'
      },
      [PaymentMethodType.OTHER]: {
        field1: 'Detalles completos de pago'
      }
    }
  },
  'show-transactions-title': `📗 *las actas*

*Acuñar*        *Cantidad*               *Tipo*{{ transactionsData }}
`,
  'transaction-row':
    '```{{ cryptoCurrency }} {{ amount }} {{ transactionType }}```'
}
