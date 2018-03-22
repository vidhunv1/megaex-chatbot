import * as i18n from 'i18n'
export default class I18n {
  static instance: I18n;

  constructor() {
    if (I18n.instance)
      return I18n.instance;

    i18n.configure({
        directory: './locales',
        locales: ['en', 'fr'],
        defaultLocale: 'en',
        // autoReload: true,
      }); 

    I18n.instance = this;
  }

  getI18n() {
    return i18n;
  }
}
