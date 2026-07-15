export interface Language {
  code: string
  name: string
  nativeName: string
  dir: "ltr" | "rtl"
}

/**
 * Supported UI languages. Actual translation strings live in
 * `src/components/i18n.ts` (react-i18next). This file only describes the
 * available locales and their text direction, consumed by the language
 * switcher and `use-language.tsx`.
 */
export const languages: Language[] = [
  {
    code: "en",
    name: "English",
    nativeName: "English",
    dir: "ltr",
  },
  {
    code: "fr",
    name: "French",
    nativeName: "Français",
    dir: "ltr",
  },
  {
    code: "ar",
    name: "Arabic",
    nativeName: "العربية",
    dir: "rtl",
  },
]
