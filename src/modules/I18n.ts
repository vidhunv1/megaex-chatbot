import i18next from 'i18next'
import { LanguageISO, Language } from '../constants/languages'
import { commonEN, signupEN, exchangeEN } from '../locales/en'
import { commonHI, signupHI, exchangeHI } from '../locales/hi'
import { CONFIG } from '../config'

export enum Namespace {
  Common = 'common',
  Signup = 'signup',
  Exchange = 'exchange'
  // Wallet = 'wallet',
  // Account = 'account'
}

export class I18n {
  static instance: I18n
  private i18n = i18next

  constructor() {
    if (I18n.instance) return I18n.instance

    i18next
      // .use(LanguageDetector)
      .init({
        debug: CONFIG.NODE_ENV === 'development',

        saveMissing: true,

        fallbackLng: LanguageISO[Language.ENGLISH],
        preload: Object.values(LanguageISO),
        interpolation: {
          escapeValue: false
        },

        ns: Object.values(Namespace),
        defaultNS: Namespace.Common,
        fallbackNS: Namespace.Common,

        resources: {
          [LanguageISO[Language.ENGLISH]]: {
            [Namespace.Common]: commonEN,
            [Namespace.Signup]: signupEN,
            [Namespace.Exchange]: exchangeEN
          },
          [LanguageISO[Language.HINDI]]: {
            [Namespace.Common]: commonHI,
            [Namespace.Signup]: signupHI,
            [Namespace.Exchange]: exchangeHI
          }
        }
      })

    this.i18n = i18next

    I18n.instance = this
  }

  get getI18n() {
    return this.i18n
  }
}

export default new I18n()
