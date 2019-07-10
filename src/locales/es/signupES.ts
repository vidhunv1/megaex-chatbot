import { BotCommand } from 'chats/types'

export const signupES = {
  'choose-language': `Hello!

You can use this bot to exchange bitcoins locally in your currency.

To get started, choose your *language* from options below.`,

  'terms-and-conditions': `Lea nuestros [Términos de Servicios](https://telegra.ph/Terms-of-Service-06-18), para continuar haz click en ✔️ *estoy de acuerdo* .`,

  'terms-agree-button': '✔️ estoy de acuerdo',

  'select-currency': 'Seleccione su moneda local.',

  'account-ready': `✅  *Cuenta creada!*

Cuenta ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC cuenta: *{{ bitcoinAddress }}*

🔐 Para su seguridad, habilite la verificación de 2 pasos en la configuración> privacidad y seguridad.`,

  'account-ready-generating-address': `✅  *Cuenta creada!*

Cuenta ID: ${BotCommand.ACCOUNT}{{ accountID }}
BTC cuenta: *{{ bitcoinAddress }}*

🔐 Para su seguridad, habilite la verificación de 2 pasos en la configuración> privacidad y seguridad.`,
  'account-ready-continue-button': '🚀 Comienza a negociar',
  'home-screen': `🔷  *Megadeals*

Use *Intercambiar* para buscar intercambios o *Billetera* para retirar o depositar BTC.`,
  'signup-error':
    'Lo siento! Se ha producido un error al registrarse. Póngase en contacto con nosotros @{{ supportBotUsername }}. Soporte 24/7.'
}
