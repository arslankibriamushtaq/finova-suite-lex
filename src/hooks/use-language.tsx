"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import i18n from "../components/i18n"
import { Language, languages } from "../lib/i18n"

interface LanguageContextType {
  currentLanguage: Language
  setLanguage: (language: Language) => void
  /**
   * Translate a key through i18next. Accepts optional interpolation values.
   * Kept for backwards compatibility with existing `useLanguage().t(...)`
   * callers; new code should prefer react-i18next's `useTranslation()`.
   */
  t: (key: string, options?: Record<string, unknown>) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

const applyLanguage = (language: Language) => {
  // Keep i18next, the <html> element and localStorage in sync.
  if (i18n.language !== language.code) {
    i18n.changeLanguage(language.code)
  }
  document.documentElement.lang = language.code
  document.documentElement.dir = language.dir
  localStorage.setItem("language", language.code)
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    // Initialise from the persisted choice so the first paint is correct.
    const saved = typeof window !== "undefined" ? localStorage.getItem("language") : null
    return languages.find((lang) => lang.code === saved) ?? languages[0]
  })

  useEffect(() => {
    applyLanguage(currentLanguage)
  }, [currentLanguage])

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language)
  }

  const t = (key: string, options?: Record<string, unknown>): string =>
    i18n.t(key, options) as string

  const isRTL = currentLanguage.dir === "rtl"

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t, isRTL }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
