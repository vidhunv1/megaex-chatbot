import i18next from 'i18next'
import { LanguageISO, Language } from '../constants/languages'
import {
  commonEN,
  signupEN,
  exchangeEN,
  walletEN,
  accountEN
} from '../locales/en'
import {
  commonHI,
  signupHI,
  exchangeHI,
  walletHI,
  accountHI
} from '../locales/hi'
import {
  commonRU,
  signupRU,
  exchangeRU,
  walletRU,
  accountRU
} from '../locales/ru'
import {
  commonAR,
  signupAR,
  exchangeAR,
  walletAR,
  accountAR
} from '../locales/ar'
import {
  commonES,
  signupES,
  exchangeES,
  walletES,
  accountES
} from '../locales/es'
import {
  commonZH,
  signupZH,
  exchangeZH,
  walletZH,
  accountZH
} from '../locales/zh'
import { CONFIG } from '../config'

export enum Namespace {
  Common = 'common',
  Signup = 'signup',
  Exchange = 'exchange',
  Wallet = 'wallet',
  Account = 'account'
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
            [Namespace.Exchange]: exchangeEN,
            [Namespace.Wallet]: walletEN,
            [Namespace.Account]: accountEN
          },
          [LanguageISO[Language.HINDI]]: {
            [Namespace.Common]: commonHI,
            [Namespace.Signup]: signupHI,
            [Namespace.Exchange]: exchangeHI,
            [Namespace.Wallet]: walletHI,
            [Namespace.Account]: accountHI
          },
          [LanguageISO[Language.RUSSIAN]]: {
            [Namespace.Common]: commonRU,
            [Namespace.Signup]: signupRU,
            [Namespace.Exchange]: exchangeRU,
            [Namespace.Wallet]: walletRU,
            [Namespace.Account]: accountRU
          },
          [LanguageISO[Language.ARABIC]]: {
            [Namespace.Common]: commonAR,
            [Namespace.Signup]: signupAR,
            [Namespace.Exchange]: exchangeAR,
            [Namespace.Wallet]: walletAR,
            [Namespace.Account]: accountAR
          },
          [LanguageISO[Language.SPANISH]]: {
            [Namespace.Common]: commonES,
            [Namespace.Signup]: signupES,
            [Namespace.Exchange]: exchangeES,
            [Namespace.Wallet]: walletES,
            [Namespace.Account]: accountES
          },
          [LanguageISO[Language.CHINESE]]: {
            [Namespace.Common]: commonZH,
            [Namespace.Signup]: signupZH,
            [Namespace.Exchange]: exchangeZH,
            [Namespace.Wallet]: walletZH,
            [Namespace.Account]: accountZH
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
