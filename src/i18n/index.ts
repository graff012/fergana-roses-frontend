// Language: Uzbek Cyrillic (default) | Uzbek Latin | Russian
export type Lang = 'uz-Cyrl' | 'uz' | 'ru';

export const LANGS: { code: Lang; label: string; short: string }[] = [
  { code: 'uz-Cyrl', label: 'Ўзбекча (кирилл)', short: 'ЎЗБ' },
  { code: 'uz', label: "O'zbekcha (lotin)", short: "O'ZB" },
  { code: 'ru', label: 'Русский', short: 'РУС' },
];

export const DEFAULT_LANG: Lang = 'uz-Cyrl';
export const LANG_STORAGE_KEY = 'fergana-roses-lang';

export type Dict = Record<string, string>;
export type AllDicts = Record<Lang, Dict>;
