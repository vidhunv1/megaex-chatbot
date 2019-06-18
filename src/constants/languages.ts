export enum Language {
  ENGLISH = 'ENGLISH',
  // RUSSIAN = 'RUSSIAN',
  // CHINESE = 'CHINESE',
  HINDI = 'HINDI'
}

export const LanguageISO: Record<Language, string> = {
  [Language.ENGLISH]: 'en',
  [Language.HINDI]: 'hi',
  // [Language.CHINESE]: 'zh',
  // [Language.RUSSIAN]: 'ru'
}

export const LanguageView: Record<Language, string> = {
  [Language.ENGLISH]: '🌎 English',
  [Language.HINDI]: '🇮🇳 Hindi',
  // [Language.RUSSIAN]: '🇷🇺 Russian',
  // [Language.CHINESE]: '🇨🇳 Chinese '
}
