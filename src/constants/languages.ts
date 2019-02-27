export enum Language {
  ENGLISH,
  HINDI,
  RUSSIAN,
  CHINESE
}

export const LanguageISO: Record<Language, string> = {
  [Language.ENGLISH]: 'en',
  [Language.HINDI]: 'hi',
  [Language.CHINESE]: 'zh',
  [Language.RUSSIAN]: 'ru'
}
