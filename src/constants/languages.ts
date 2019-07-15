export enum Language {
  ENGLISH = 'ENGLISH',
  RUSSIAN = 'RUSSIAN',
  CHINESE = 'CHINESE',
  ARABIC = 'ARABIC',
  SPANISH = 'SPANISH',
  HINDI = 'HINDI'
}

export const LanguageISO: Record<Language, string> = {
  [Language.ENGLISH]: 'en',
  [Language.HINDI]: 'hi',
  [Language.CHINESE]: 'zh',
  [Language.RUSSIAN]: 'ru',
  [Language.ARABIC]: 'ar',
  [Language.SPANISH]: 'es'
}

export const LanguageView: Record<Language, string> = {
  [Language.ENGLISH]: '🌎 English',
  [Language.RUSSIAN]: '🇷🇺 русский',
  [Language.ARABIC]: '🇦🇪 عربى',
  [Language.SPANISH]: '🇪🇸 español',
  [Language.HINDI]: '🇮🇳 Hindi',
  [Language.CHINESE]: '🇨🇳 中文 '
}
