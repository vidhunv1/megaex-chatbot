import * as i18n from 'i18n'

export class I18n {
  static instance: I18n

  constructor() {
    if (I18n.instance) return I18n.instance

    i18n.configure({
      directory: './locales',
      locales: ['en', 'hi'],
      defaultLocale: 'en'
      // autoReload: true,
    })

    I18n.instance = this
  }

  get getI18n() {
    return i18n
  }

  static getAvailableLanguages() {
    return [{ name: 'English', code: 'en' }, { name: 'Hindi', code: 'hi' }]
  }

  static isLanguageName(language: string): boolean {
    const l = I18n.getAvailableLanguages()
    for (let i = 0; i < l.length; i++) {
      if (l[i].name === language) return true
    }
    return false
  }

  static getLanguageCode(language: string): string | undefined {
    const l = I18n.getAvailableLanguages()
    for (let i = 0; i < l.length; i++) {
      if (l[i].name === language) return l[i].code
    }
    return undefined
  }
}

export default new I18n()