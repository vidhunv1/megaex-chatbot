import { DealsError } from 'chats/exchange/deals'
import { BotCommand } from 'chats/types'
import { TradeRating, TradeError } from 'models/Trade'

export const exchangeES = {
  home: {
    exchange: `💵  *Intercambiar BTC-{{ fiatCurrency }}*

✅  Soporte 24/7 a través de {{ supportBotUsername }}
🔒  Todas las operaciones están aseguradas con garantía de depósito.

Tasa de mercado: {{ formattedMarketRate }} ({{ exchangeSourceName }})`,

    'my-orders-cbbutton': 'Mi activo ({{ orderCount }})',
    'create-order-cbbutton': '📊 Crear orden',
    'buy-cbbutton': '📉 Compra rapida',
    'sell-cbbutton': '📈 Venta rápida'
  },

  deals: {
    'no-quick-sell': `📉  *Compra rapida*

No hay órdenes de compra activas. Crear una nueva orden de compra.`,
    'new-quick-sell-cbbutton': '📗 Nueva orden de compra',
    'no-quick-buy': `📉  *Venta rápida*

No hay órdenes de venta activas. Crear una nueva orden de venta.`,
    'new-quick-buy-cbbutton': '📕 Nueva orden de venta',
    trade: {
      'dispute-resolved-seller-win': `👩‍🎓  *Disputa resuelta*

Después de una revisión cuidadosa basada en la prueba presentada por ambas partes, confirmamos que usted es genuino de su parte en el intercambio.

Se han tomado las medidas apropiadas contra el comprador. Lamentamos cualquier molestia causada.

Los fondos bloqueados han sido *liberados*. Revise su billetera.`,
      'dispute-resolved-buyer-win': `👩‍🎓  *Disputa resuelta*

Después de una revisión cuidadosa basada en la prueba presentada por ambas partes, confirmamos que usted es genuino de su parte en el intercambio.

Se han tomado las medidas apropiadas contra el vendedor. Lamentamos cualquier molestia causada.

{{ cryptoAmount }} ha sido *acreditado*. Revise su billetera.`,
      'dispute-resolved-seller-lose': `👩‍🎓  *Disputa resuelta*

Después de una revisión cuidadosa basada en la prueba presentada por ambas partes, confirmamos que hay una falla en su parte en este intercambio.

NOTA: La ofensa repetida resultará en una prohibición permanente.`,
      'dispute-resolved-buyer-lose': `‍🎓  *Disputa resuelta*

Después de una revisión cuidadosa basada en la prueba presentada por ambas partes, confirmamos que hay una falla en su parte en este intercambio.

NOTA: La ofensa repetida resultará en una prohibición permanente.`,
      'referral-comission': `🚀  *Comisión recibida*

Felicidades! Recibió la comisión {{ cryptoAmount }} de su intercambio de referencias. Seguir invitando`,
      'open-dispute-cbbutton': '👩‍🎓 Tema abierto',
      'dispute-initiator': `*Apoyo comercial* ${BotCommand.TRADE}{{ tradeId }}

Un problema se ha planteado en este comercio. El comercio está bloqueado temporalmente. Por favor contacte a @{{ legalUsername }} para resolver esto.`,
      'dispute-received': `*Apoyo comercial* ${BotCommand.TRADE}{{ tradeId }}

El usuario ha planteado un problema en este comercio.

Por favor contacte a @{{ legalUsername }} para resolver esto.`,
      'confirm-payment-received': `*Confirmación de pago*

Está seguro de que ha recibido *{{ fiatAmount }}* del comprador?`,
      'confirm-payment-received-yes-cbbutton': 'Sí',
      'confirm-payment-received-no-cbbutton': 'No',
      'payment-released-buyer': `🚀 *{{ cryptoCurrency }} acreditado* ${
        BotCommand.TRADE
      }{{ tradeId }}

Su billetera se acredita con *{{ cryptoAmount }}* de este comercio.`,
      'payment-released-seller': `🚀 *Comercio exitoso* ${
        BotCommand.TRADE
      }{{ tradeId }}

*{{ cryptoAmount }}* cargado en su billetera y liberado al comprador.`,
      'give-rating': `🏅  *Califica este comercio*

Da tu calificación para este comercio.`,
      'give-review': `🗣  *Examen comercial*

Escriba una breve reseña de este comercio.`,
      'end-review': `Review added.

🎉 Invita a tus amigos para que ellos también puedan tener la mejor experiencia, puedes usar tu recomendación para ganar tarifas de sus intercambios.

{{ referralLink }}`,
      'skip-review': 'Omitir ➡️',
      rating: {
        [TradeRating.VERY_NEGATIVE]: '👎',
        [TradeRating.NEGATIVE]: '2 ⭐',
        [TradeRating.POSITIVE]: '3 ⭐',
        [TradeRating.VERY_POSITIVE]: '4 ⭐',
        [TradeRating.EXCELLENT]: '5 🌟'
      },
      'confirm-payment-sent': `*Confirmar pago*

Ha enviado *{{ fiatAmount }}* a los vendedores *{{ paymentMethodType }}*?`,
      'confirm-payment-sent-yes-cbbutton': 'Sí',
      'confirm-payment-sent-no-cbbutton': 'No',
      'payment-sent-buyer': `*🛎 Comercio* ${BotCommand.TRADE}{{ tradeId }}

El vendedor ha sido notificado. Por favor, espere a que el vendedor confirme su pago.

En el caso, no hay confirmación; usted puede 'plantear problema'.`,
      'payment-sent-seller': `🛎  *Pago confirmado* ${
        BotCommand.TRADE
      }{{ tradeId }}

El comprador ha enviado *{{ fiatAmount }}* a su *{{ paymentMethod }}*. Por favor confirme cuando reciba el pago.

En caso de que no reciba el pago, puede *Generar un problema*.`,
      'escrow-warn-seller': `*Info*

El comprador aún tiene que hacer el pago por el comercio. ${
        BotCommand.TRADE
      }{{ tradeId }}.

Puede comunicarse con nuestro * soporte * si cree que algo está mal, ellos lo ayudarán.

Si no se recibe confirmación en *{{ paymentSendTimeout }} mins*, la cantidad bloqueada se le entregará automáticamente.`,
      'escrow-warn-buyer': `*Recordatorio de pago comercial*

Aún no ha realizado el pago de la operación.${
        BotCommand.TRADE
      }{{ tradeId }}. Haga clic en 'He pagado' si ya ha realizado el pago.

⚠️ Tiene *{{ paymentSendTimeout }} mins* para realizar este pago. Cualquier pago realizado después de eso será inválido.`,
      'escrow-closed-seller': `🤷‍♂️  *Comercio cerrado*

El comprador no pagó y confirmó el pago por el comercio. ${
        BotCommand.TRADE
      }{{ tradeId }}.

Tu *{{ cryptoAmount }}* te ha sido devuelto. Para cuestiones relacionadas con este comercio, póngase en contacto con nuestro *soporte*.`,
      'escrow-closed-buyer': `🤷‍♂️  *Comercio cerrado*

Usted no hizo ningún pago al vendedor por el comercio. ${
        BotCommand.TRADE
      }{{ tradeId }}. Para cuestiones relacionadas con este comercio, póngase en contacto con nuestro *soporte*.`,
      'cancel-trade-confirm': `Estás seguro de que quieres cancelar la operación ${
        BotCommand.TRADE
      }{{ tradeId }} on *{{ fiatAmount }}*?

⚠️ Nunca cancele si ya ha pagado al vendedor.`,
      'cancel-trade-confirm-yes-cbbutton': 'sí',
      'cancel-trade-confirm-no-cbbutton': 'no',
      'cancel-trade-success': 'Este comercio fue cancelado por usted.',
      'cancel-trade-not-canceled': '-',
      'cancel-trade-fail': 'El comercio ya está cancelado o ha expirado.',
      'cancel-trade-notify': `❗️El comercio ${
        BotCommand.TRADE
      }{{ tradeId }} fue cancelado por el user.`,
      'trade-rejected-notify':
        'El usuario canceló este intercambio. Puede elegir otras buenas ofertas en Compra rapida / Vender.',
      'trade-rejected-success': 'Usted rechazó este comercio.',
      'trade-accepted-seller-success': `🛎 *Comercio abierto* ${
        BotCommand.TRADE
      }{{ tradeId }}

Se ha notificado al usuario que deposite *{{ fiatPayAmount }}* en su *{{ paymentMethodName }}*.

[Telegram contact](tg://user?id={{ buyerUserId }})

Se le notificará cuando este pago se haya marcado como completado.`,
      'trade-accepted-buyer-no-payment-info':
        'Enviar un mensaje al vendedor para los detalles de pago.',
      'trade-accepted-buyer': `🛎  *Comercio aceptado* ${
        BotCommand.TRADE
      }{{ tradeId }}

Haga un pago de {{ fiatPayAmount }} a través de {{ paymentMethodName }}, recibirá *{{ cryptoAmount }}* cuando su pago esté confirmado

*{{ paymentMethodName }}*
Cantidad: *{{ fiatPayAmount }}*
Referencia de pago: *T{{ tradeId }}*
{{ paymentDetails }}

[Telegram contact](tg://user?id={{ buyerUserId }})

🔒 Este comercio está asegurado. Pago válido solo para *{{ paymentSendTimeout }} mins*.`,
      'payment-received-cbbutton': '💵  Pago recibido',
      'payment-sent-cbbutton': '💸  He pagado',
      'trade-accepted-fail':
        '️Lo siento. Hubo un error en la apertura de este comercio.',

      errors: {
        [TradeError.TRADE_EXISTS_ON_ORDER]:
          '❗️ Usted ya tiene un comercio existente en este pedido. No puede realizar múltiples operaciones para el mismo pedido.',
        [TradeError.NOT_FOUND]: '❗️ No pudimos encontrar este comercio.',
        [TradeError.TRADE_EXPIRED]:
          '❗️ Este comercio no es válido o ha caducado.',
        [TradeError.INSUFFICIENT_BALANCE]:
          '❗️ No tienes saldo suficiente para abrir este comercio.'
      },
      'init-get-confirm-buy': `🛎 *Nuevo comercio* ${
        BotCommand.TRADE
      }{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} quiere comprar *{{ cryptoCurrencyAmount }}* para *{{ fiatValue }}* a precio {{ fixedRate }}.

Quieres aceptar este intercambio?`,
      'init-get-confirm-sell': `🛎 *Nuevo comercio* ${
        BotCommand.TRADE
      }{{ tradeId }}

${
        BotCommand.ACCOUNT
      }{{ requestorAccountId }} quiere vender *{{ cryptoCurrencyAmount }}* por *{{ fiatValue }}* al precio {{ fixedRate }}.

Quieres aceptar este intercambio?`,
      'trade-init-yes-cbbutton': 'Sí',
      'trade-init-no-cbbutton': 'No',
      'trade-init-no-response': `💤 *Ninguna respuesta*

Este usuario está actualmente ausente. Por favor, intente otros oficios.`,
      'trade-init-expired': `⏳ *Comercio expiró*

Como no respondiste, la solicitud de comercio ${
        BotCommand.TRADE
      }{{ tradeId }} Ha expirado y cancelado.

Puedes pausar tu pedido fácilmente si estás fuera. Esto asegura una buena experiencia para otros comerciantes.`
    },
    'request-deposit-notify': `🛎  *Nueva solicitud de compra*

Tiene una nueva solicitud de compra en su pedido ${
      BotCommand.ORDER
    }{{ orderId }}.

*{{ requesterName }}* quiere comprar *{{ formattedCryptoValue }}* para *{{ formattedFiatValue }}*.

[Telegram contacto](tg://user?id={{ requesterUserId }})

⚠️ Debe depositar los fondos requeridos antes de poder iniciar este intercambio.`,
    errors: {
      [DealsError.ORDER_NOT_FOUND]: 'Orden no encontrada.',
      [DealsError.SELF_OPEN_DEAL_REQUEST]:
        'No puedes abrir un contrato por tu cuenta.!',
      default:
        'Lo siento. Ocurrió un error. Por favor, inténtelo de nuevo más tarde.'
    },
    'next-cbbutton': 'siguiente',
    'prev-cbbutton': 'anterior',
    'show-buy-deals': `📉 *Compra rapida* ({{ currentPage}}/{{ totalPages }})

Por favor, seleccione el pedido que desea comprar.

precio / {{ cryptoCurrencyCode }}, método de pago y la calificación del comerciante.
`,
    'show-sell-deals': `📈 *Venta rápida* ({{ currentPage}}/{{ totalPages }})

Seleccione el pedido al que desea vender.

*Precio / {{ cryptoCurrencyCode }}*, *Método de pago* y *Calificación del comprador* se muestran.
`,
    'id-verified': 'Verification: ✅ KYC verificado',
    'show-buy-deal': `📉 *Comprar {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

Este acuerdo es de * {{ realName }} *.
{{ verificationText }}
Cuenta ID: ${BotCommand.ACCOUNT}{{ accountId }}
Clasificación:  {{ rating }} ⭐️

*Detalles del pago*:
-----------------
Método de pago: {{ paymentMethodName }}
Condiciones: _{{ terms }}_

*Detalles del comercio*:
----------------
Precio: {{ rate }} / {{ cryptoCurrencyCode }}
Compra cantidad: {{ formattedAmount }}`,
    'show-sell-deal': `📈 *Vender {{ cryptoCurrencyCode }}* (${
      BotCommand.ORDER
    }{{ orderId }})

Esta orden de venta es de *{{ realName }}*.
{{ verificationText }}
Cuenta ID: ${BotCommand.ACCOUNT}{{ accountId }}
Condiciones:  {{ rating }} ⭐️

*Detalles del pago*:
-----------------
Método de pago: {{ paymentMethodName }}
Condiciones: _{{ terms }}_

*Detalles del comercio*:
----------------
Precio: {{ rate }} / {{ cryptoCurrencyCode }}
Cantidad de venta: {{ formattedAmount }}`,

    'show-sell-insufficient-funds': `Fondos insuficientes en la cuenta de los comerciantes para comenzar a tratar. Solicite al vendedor que deposite los fondos después de lo cual puede comenzar el trato.`,
    'request-buy-deal-deposit-cbbutton': '📲 Contacte al vendedor',

    'open-buy-deal-cbbutton': '🛎 Compre {{ cryptoCurrencyCode }} desde aquí',
    'open-sell-deal-cbbutton': '🛎 Vende {{cryptoCurrencyCode}} desde aquí',
    'back-cbbutton': '⬅️ Back',
    'user-reviews': '💬 Opiniones usuarios',
    'input-buy-amount': `💵  *Ingrese de compra*

Introduzca la cantidad {{ fiatCurrencyCode }} entre *{{ minFiatValue }}* y *{{ maxFiatValue }}*.

Por ejemplo: 1000 {{ fiatCurrencyCode }}.`,
    'input-sell-amount': `💵  *Ingrese el monto de venta*

Introduzca la cantidad {{ fiatCurrencyCode }} entre *{{ minFiatValue }}* y *{{ maxFiatValue }}*.

Por ejemplo: 1000 {{ fiatCurrencyCode }}.`,
    'input-payment-details': `*Detalles del pago*

Seleccione o agregue nuevos detalles de pago para *{{ paymentMethodType }}* para que el comprador le envíe el dinero.`,
    'skip-input-payment-details': 'omitir',
    'add-payment-details': '➕ Añadir {{ paymentMethodName }}',
    'confirm-input-buy-amount': `*Abrir este comercio?*

Está seguro de que desea comprar *{{ cryptoValue }}* para *{{ fiatValue }}* al precio {{ rate }}?

❕ Al hacer clic en *'Sí'*, usted acepta los términos comerciales.`,

    'confirm-input-sell-amount': `*Abrir este comercio?*

Está seguro de que desea vender *{{ cryptoValue }}* por *{{ fiatValue }}* a precio *{{ rate }}*?

❕ Al hacer clic en *'Sí'*, usted acepta los términos comerciales.`,
    'confirm-input-amount-yes-cbbutton': 'Sí',
    'confirm-input-amount-no-cbbutton': 'No',
    'show-open-deal-request': `📲 *Solicitud enviada!*

Su solicitud ha sido enviada, este acuerdo solo comenzará después de que el vendedor haya depositado los fondos requeridos.

⚠️ IMPORTANTE: Nunca realice ningún pago antes de que el depósito haya sido confirmado aquí. No hagas tratos fuera de MegaDeals, corres el riesgo de perder tu dinero.

*Contacto telegrama vendedor*: [Telegram contacto](tg://user?id={{ telegramUserId }})`,
    'show-open-deal-cancel': 'Oferta cancelada.',
    'trade-opened-message': 'El comercio está activo ahora!',
    'show-opened-trade': `*Comercio* ${BotCommand.TRADE}{{ tradeId }}

esperante a ${
      BotCommand.ACCOUNT
    }{{ traderAccountId }}. Si el usuario no confirma el inicio de la operación dentro de {{ timeoutMinutes }} minutos, el acuerdo se cancelará automáticamente.

⚠️ IMPORTANTE: Por razones de seguridad, no realice ninguna operación fuera de MegaDeals.

Nunca cancele la transacción si ya ha realizado el pago.

* Cancelar automáticamente en {{ timeoutMinutes }} minutos *`,
    'cancel-trade-cbbutton': '🚫 Cancelar comercio'
  },

  'my-orders': {
    'my-sell-order-cbbutton': 'Orden de venta @ {{ rate }}',
    'my-buy-order-cbbutton': 'Orden de compra @ {{ rate }}',
    'buy-deal-cbbutton': '🛎 Comprar comercio - {{ cryptoAmount }}',
    'sell-deal-cbbutton': '🛎 Vender comercio - {{ cryptoAmount }}',
    'deposit-cryptocurrency': '📩 Depositar {{ cryptoCurrencyCode }}',
    'show-active-orders': `*Órdenes activas*

Sus operaciones y pedidos en curso creados por usted se enumeran.
`,
    'order-enabled': 'Su pedido está activo ahora.',
    'input-payment-details-field': `Escriba su *{{ fieldName }}* para *{{ paymentMethod }}*`,
    'order-disabled': `Su pedido se establece como inactivo.
Haga clic en el botón *'Activo'* para habilitar esta orden.`,
    'show-orders': 'TODO: Mostrar mis pedidos',

    'terms-not-added': 'nada',
    'my-buy-order-info': `📗  *Mi orden de compra* - ${
      BotCommand.ORDER
    }{{orderId}}

*Estado*: {{ status }}
*{{ cryptoCurrencyCode }} Precio*: {{ rate }}
*Min. cantidad*: {{ minAmount }}
*Max. cantidad*: {{ maxAmount }}
*Método de pago*: {{ paymentMethod }}

Condiciones: _{{ terms }}_

*Enlace de pedido*: {{ orderLink }}
Comparte este enlace. Quien haga clic en este enlace puede abrir un intercambio con usted.
`,
    'payment-info-not-added': 'No añadido',
    'insufficient-sell-order-balance':
      '⚠️ Saldo insuficiente. Deposite la cantidad mínima para iniciar ofertas en este pedido.',
    'my-sell-order-info': `*📕 Mi orden de venta* - ${
      BotCommand.ORDER
    }{{orderId}}

*Estado*: {{ status }}
*precio {{ cryptoCurrencyCode }}*: {{ rate }}
*Min. cantidad*: {{ minAmount }}
*Max. cantidad*: {{ maxAmount }}
*Método de pago*: {{ paymentMethod }}
*Información de pago*: {{ paymentInfo }}

Condiciones: _"{{ terms }}"_

*Enlace de pedido*: {{ orderLink }}
Comparte este enlace y abre un acuerdo directamente con otros comerciantes.
`,
    'edit-amount-cbbutton': '⚖️ Cantidad',
    'edit-rate-cbbutton': '💸 Precio BTC',
    'edit-terms-cbbutton': '📝 Condiciones',
    'edit-payment-method-cbbutton': '💳 Método de pago',
    'toggle-active-cbbutton': 'Activa',
    'delete-order-cbbutton': '🗑️ Borrar!',
    'edit-order': '✏️ Orden de edición',
    'go-back-cbbutton': '⬅️ atrás',
    'order-edit-success': '✅ Tu pedido está actualizado.',
    'edit-payment-details': '📃 Actualizar información de pago',
    'order-edit-rate': `*Establecer precio {{ cryptoCurrencyCode }}*

Ingrese el precio fijo para {{ cryptoCurrencyCode }} en *{{ fiatCurrencyCode }}* o ingrese el porcentaje (%) para establecer un precio de margen.

Ejemplo: *{{ marketRate }}* or *2%*`,
    'order-edit-terms': `📋 *Condiciones*

Escriba sus términos para el comercio. Esto se mostrará en su pedido.`,
    'order-delete-success': 'Orden eliminada'
  },

  'create-order': {
    show: `📝 *Crear orden*

Seleccione el tipo de orden.`,
    'new-buy-order-cbbutton': '📗  Quiero comprar',
    'new-sell-order-cbbutton': '📕  Quiero vender',
    'input-fixed-rate': `*💸 Establecer precio {{ cryptoCurrencyCode }}*

Ingrese un precio fijo para {{ cryptoCurrencyCode }} en *{{ fiatCurrencyCode }}* o ingrese el porcentaje (%) para establecer un precio de margen.

Ejemplo: *{{ marketRate }}* or *2%*`,
    'input-margin-rate': `*💸 Establecer precio {{ cryptoCurrencyCode }}*

Utilice el precio de margen para establecer un precio dinámico basado en las tasas de mercado. Use + / - porcentaje (%) para vender por encima o por debajo de la tasa de mercado actual.

Tasa de mercado actual: {{ marketRate }} ({{ marketRateSource }})

Ejemplo: 3% o -2%`,
    'use-margin-price-cbbutton': 'ℹ️ Precios de margen',
    'use-fixed-price-cbbutton': '⬅️ Precio',
    'back-cbbutton': '⬅️ atrás',
    'input-amount-limits': `⚖️ *Total de la orden*

Enter the order amount in *{{ fiatCurrencyCode }}*.

Ejemplo: Ya sea 1000 o 500-1000 (límite mínimo-máximo)`,
    'buy-order-created': '✅  Se crea su orden de compra.',
    'sell-order-created': '✅  Se crea su pedido de venta..',
    'create-error':
      '❗️  No se pudo crear esta orden. Por favor, inténtelo de nuevo más tarde.',
    'select-payment-method': `💳  *Método de pago*

Select a payment method.`,
    'my-pm-cbbutton': '{{ paymentMethodName }} - {{ paymentDetails }}',
    'more-pm-cbbutton': 'mostrar más »'
  },

  'active-orders': {}
}
