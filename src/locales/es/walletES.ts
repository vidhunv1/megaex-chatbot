import { BotCommand } from 'chats/types'
import { TransferErrorType } from 'models'

export const walletES = {
  /* Home */
  home: {
    wallet: `💼  *Bitcoin Billetera*

 saldo:    {{ cryptoBalance }}
 Valor:    {{ fiatBalance }}
 Obstruido:    {{ blockedBalance }}

   Invitado:    {{ referralCount }} usuarios
Ganancias:    {{ earnings }}

📒 ${BotCommand.TRANSACTIONS}`,

    'send-cryptocurrency-cbbutton': '⚡️ Enviar',
    'my-address': '📩  Depositar',
    withdraw: '📤  Retirar',
    'transaction-credit': 'Crédito',
    'transaction-debit': 'Débito'
  },

  /* Deposit */
  deposit: {
    'show-address': `
📩  *Depositar {{ cryptoCurrencyCode }}*

Los fondos estarán disponibles en su billetera después de la confirmación de la red de {{ confirmations }}. Use la dirección {{ cryptoCurrencyCode }} a continuación para depositar fondos en su billetera.

NOTA: *Deposite solo los fondos {{ cryptoCurrencyCode }}* en esta dirección.`
  },

  /* Send Coin */
  'send-coin': {
    'input-amount': `⚡️ *Cantidad a enviar*

Ingrese la cantidad en *{{ cryptoCurrencyCode }}* o *{{ fiatCurrencyCode }}*.

Ejemplo: {{ cryptoCurrencyBalance }}

Disponible: {{ cryptoCurrencyBalance }}
    Valor: {{ fiatValue }}`,
    confirm: `👁‍🗨*Confirmar*

Confirmar es esto correcto? Si es así, haga clic en * "Confirmar" *.:

Cantidad: {{ cryptoCurrencyAmount }}
 Valor:  {{ fiatValue }})
`,
    'confirm-button': '✔️  Confirmar',
    'insufficient-balance': `❗️  *Fondos insuficientes*

Agregue {{ cryptoCurrencyCode }} a su billetera para enviar este pago.

*Saldo disponible*: {{ cryptoCurrencyBalance}}`,
    'invalid-amount': `❗️  *Cantidad no válida*

Ingrese una cantidad válida.`,
    'error-creating-payment':
      'Se ha producido un error al crear este pago. Inténtalo de nuevo más tarde.',
    'show-created-link': `✅  *Cheque creado*

{{ paymentLink }}
Comparte este enlace de forma privada. Cualquier persona con acceso a este enlace obtendrá los fondos.

Este enlace caducará en *{{ expiryTime }} horas*.`,
    'payment-link-expired':
      'El enlace de pago que creó de *{{ cryptoValue }}* ha caducado.',
    'transfer-errors': {
      [TransferErrorType.ALREADY_CLAIMED]:
        'Este enlace de pago ha sido reclamado.',
      [TransferErrorType.EXPIRED]: 'Este enlace de pago ha caducado.',
      [TransferErrorType.INSUFFICIENT_BALANCE]: `La cuenta de los usuarios no tiene saldo suficiente para este pago, puede contactarlos para financiar su cuenta y reintentar este pago.

*Contact*: @{{ linkCreatorUsername }}`,
      [TransferErrorType.INVALID_CODE]: 'Este enlace de pago no es válido.',
      [TransferErrorType.SELF_CLAIM]: `✅  *Enlace de pago*

Amount: *{{ cryptoValue }}*
Comparte el enlace en privado para enviar los fondos. Cualquier persona con acceso a este enlace obtendrá los fondos.
`,
      [TransferErrorType.TRANSACTION_ERROR]:
        'Ocurrió un error. Por favor, inténtelo de nuevo más tarde.'
    },
    'payment-success': {
      receiver: `✅ *Nuevo credito*

Recibiste *{{ cryptoValueReceived }}* de [{{senderName}}](tg://user?id={{ senderTelgramId }}).`,
      sender: `✅ *Nuevo débito*

[{{ receiverName }}](tg://user?id={{ receiverTelegramId }}) recibió *{{ cryptoValueSent }} * de su enlace de pago.`
    }
  },

  /* Withdraw */
  withdraw: {
    'input-amount': `*Retirar BTC*

Ingrese la cantidad en *{{ cryptoCurrencyCode }}* para retirar.
Ejemplo: 0.018291 BTC

Disponible: {{ cryptoCurrencyBalance }}
Valor: {{ fiatValue }}`,
    'input-address': `*BTC address*

Ingrese la dirección de la billetera {{ cryptoCurrencyName }} a la que desea retirarse.
`,
    'insufficient-balance': `❗️ *Fondos insuficientes*

Los fondos en la cartera son demasiado bajos. Agregue fondos y vuelva a intentarlo.

*Disponible balance*: {{ cryptoCurrencyBalance}}`,
    'invalid-address': `❗️ *Inválida Address*

Verifique la dirección *{{ cryptoCurrencyName }}* e intente nuevamente.
`,
    'less-than-min-error': `❗️ El monto mínimo de retiro es *{{ minWithdrawAmount }}*.
`,
    'create-error': `Ocurrió un error.

Por favor, inténtelo de nuevo más tarde. Si aún estás enfrentando un problema, contacta a support @{{ supportUsername }}`,
    confirm: `👁‍🗨  *Verificar detalles*

To Address: {{ toAddress }}
    Cantidad: {{ cryptoCurrencyAmount }}
     Valor: {{ fiatValue }})
`,
    'confirm-button': '✔️ Confirmar',
    'create-success': `⏳ *Procesamiento de retirada...*

Su solicitud de retiro está en cola. Recibirás una notificación cuando se procese.

Se utilizará la tarifa de red de *{{ feeValue }}*.`,
    'withdraw-processed': `✅ *Retiro completado*

Su retiro de *{{ cryptoCurrencyAmount }}* se completó.

{{ withdrawalLink }}`
  },

  transaction: {
    'new-incoming-tx': `🕘  *Entrante {{ cryptoCurrencyCode }}*

Tienes un nuevo depósito de *{{ cryptoCurrencyValue }}*. Se agregará después de la confirmación {{ requiredConfirmation }} en la red.

txid: [{{ txid }}]({{ txUrl }})`,
    'new-tx-confirmed': `📩  *{{ cryptoCurrencyCode }} recibido*

*{{ cryptoCurrencyValue }}* añadido a la billetera.`,
    'source-name': {
      core: 'depositar',
      payment: 'pago',
      withdrawal: 'retirar',
      release: 'lanzamiento',
      block: 'bloquear',
      trade: 'comercio',
      comission: 'comisión',
      fees: 'matrícula'
    }
  }
}
