import { AccountHomeError } from 'chats/account/home'
import { BotCommand } from 'chats/types'

export const accountES = {
  home: {
    'passport-data-received': `✅ *Identidad recibida*

Sus documentos de verificación han sido recibidos. Esto debe ser procesado en 3 horas de trabajo. Te informaremos cuando sea procesado.`,
    'trade-message': `Ver comercio ${BotCommand.TRADE}{{ tradeId }}`,
    'send-message-cbbutton': '📝 Escribe un message',
    'send-response-cbbutton': '📝 Escribir respuesta',
    'message-sent': 'Mesage enviado!',
    'new-photo-message': `📨 <b>Message de</b> ${
      BotCommand.ACCOUNT
    }{{ accountId }}
{{ tradeInfo }}
Foto recibida`,
    'message-not-sent': '❗️ fallo al enviar.',
    'enter-message':
      'Introduzca el mensaje para el usuario. (máx. 400 caracteres)',
    'new-message': `📨 <b>Message de</b> ${BotCommand.ACCOUNT}{{ accountId }}

----------------

{{ messageContent }}

----------------
{{ tradeInfo }}`,
    'back-cbbutton': '⬅️ atrás',
    'more-cbbutton': 'Más »',
    'no-reviews-available': 'Aún no hay comentarios.',
    'user-review': `({{ currentPage }}/{{ totalPages }}) *Revisión para* ${
      BotCommand.ACCOUNT
    }{{ opAccountId }}

{{ rating }}
_{{ review }}_

Por *{{ reviewerName }}*. Cambiado por {{ tradeVolume }} {{ cryptoCurrencyCode }}.`,
    errors: {
      [AccountHomeError.ACCOUNT_NOT_FOUND]: 'No se pudo encontrar esta cuenta..'
    },
    account: `👤  *Mi cuenta*

ID de la cuenta: ${BotCommand.ACCOUNT}{{ accountID }}

💵 *Total de ofertas:* {{ dealCount }}
💎 Volumen: {{ tradeVolume }}
⭐ Clasificación: {{ rating }}

🤝 Referencias Invitadas: {{ referralCount }} users
💰 Ingresos por referencia: {{ earnings }}

💳 *Métodos de pago:* {{ paymentMethods }}`,

    'dealer-account': `*Detalles de la cuenta* (${
      BotCommand.ACCOUNT
    }{{ accountId }})

[contacto {{ firstName }}](tg://user?id={{ telegramUserId }})

💵 Ofertas comerciales: {{ dealCount }}
💎 Volumen de comercio: {{ tradeVolume }} {{ cryptoCurrencyCode }}
⭐ Clasificación: {{ rating }}`,

    'user-reviews-cbbutton': '🗣 Opiniones ({{ reviewCount }})',
    'block-dealer-cbbutton': '⛔️ Bloquear usuario',
    'unblock-dealer-cbbutton': 'Desbloquear usuario',
    'verify-account-cbbutton': '🆔 Verificar KYC',
    'manage-payment-methods-cbbutton': '💳 Métodos de pago',
    'referral-link-cbbutton': '🤝 Remisión',
    'settings-cbbutton': '️⚙️ Ajustes',
    'no-payment-method': `Ninguna`
  },

  'payment-method': {
    'does-not-exist': `❗️  *Método de pago no válido*

Este método de pago no existe.

Puede solicitar @ {{ supportBotUsername }} para obtener un método de pago válido agregado.`,

    'create-error':
      'Lo siento. No pudimos crear este método de pago. Por favor, inténtelo de nuevo más tarde.',
    'edit-cbbutton': '🖋  Editar metodos de pago',
    'add-cbbutton': '➕  Añadir método de pago',
    'show-all': `💳 *Métodos de pago*

{{ paymentMethodsList }}`,
    'show-edit': `*Editar el método de pago*

Haga clic en el método de pago que desea editar.`,
    'select-to-add': `*Seleccionar*

Seleccione su método de pago para agregar de las opciones a continuación.`,
    'edit-enter-field': 'Entrar el *{{ fieldName }}*',
    created: `✅ Método de pago *añadido*

Se añade su método de pago.

{{ paymentMethodInfo }}
Ahora puedes usar esto para recibir dinero al vender {{ cryptoCurrencyCode }}.`,
    updated: `✅ *Método de pago actualizado*

Su método de pago está actualizado..

{{ paymentMethodInfo }}`,
    'none-added': `No hay métodos de pago añadido. Se utilizan para transferir dinero a usted cuando usted está vendiendo.`
  },

  referral: {
    'show-info': `🤝  *Referir y Ganar*

Su recuento de referencias: {{ referralCount }} users
Tasa de remisión: {{ referralFeesPercentage }}%

Gana bitcoins con cada intercambio que haga tu referido. Obtendrá el {{ referralFeesPercentage }}% de la tarifa comercial.

Por ejemplo: Si su referido cotiza 1 BTC, obtendrá 0.004 BTC del 0.008 BTC que tomamos como tarifa.

Procesado y acreditado instantáneamente a su billetera. Sin limitaciones y sin fecha de caducidad.

Copia el mensaje de abajo y compártelo.. 👇`
  },

  settings: {
    'invalid-username': `❌ *Error*

Esta ID de cuenta no es válida. Por favor, compruebe la ID que ha introducido y vuelva a intentarlo.`,

    'update-success': 'cambiado',
    'username-show': `👤 *Ingresar Cuenta ID*

Sólo letras y números en inglés entre 3 y 15 caracteres.

NOTA: esta acción es definitiva, no podrá cambiar su ID de cuenta nuevamente.
`,
    'back-to-settings-cbbutton': '⬅️ atrás',
    'settings-currency-updated': `Su moneda se actualiza a *{{ updatedCurrencyCode }}*.`,
    'show-rate-source': `📊 *Fuente de tarifas*

Seleccione la fuente de tipo de cambio que desea utilizar.
Actualmente activo: *{{ exchangeSource }}*.

Nota: Cambiar esto afectará sus pedidos activos si ha usado precios de margen.
`,
    'show-more': 'Más »',
    'show-currency': `💵 *Moneda*

Haga clic para cambiar su moneda.

Actualmente estás utilizando *{{ fiatCurrencyCode }}*. Seleccione una moneda. Haga clic en "más" para ver otras monedas disponibles.`,
    'show-language': `🌎 *Lenguaje*

Elige el idioma para la aplicación.

Nota: los mensajes antiguos (enviados y recibidos) no se cambiarán a un nuevo idioma.

Actualmente activo: *{{ language }}*`,
    'currency-cbbutton': '💵 Moneda',
    'language-cbbutton': '🌎 Lenguaje',
    'rate-source-cbbutton': '📊 Fuente de tarifas',
    'show-settings': `⚙️ Ajustes

What do you want to edit?`,
    'username-cbbutton': '👤  Cambiar ID de cuenta'
  }
}
