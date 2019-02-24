import i18next from 'i18next'
import { LanguageISO, Language } from '../constants/languages'
import commonEN from '../locales/en/common'
import commonHI from '../locales/hi/common'
import { CONFIG } from '../config'

export enum Namespace {
  Common = 'common'
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

        interpolation: {
          escapeValue: false
        },

        ns: Object.values(Namespace),
        defaultNS: Namespace.Common,
        fallbackNS: Namespace.Common,

        resources: {
          [LanguageISO[Language.ENGLISH]]: {
            [Namespace.Common]: commonEN
          },
          [LanguageISO[Language.HINDI]]: {
            [Namespace.Common]: commonHI
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
