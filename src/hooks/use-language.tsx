"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { Language, languages, TranslationKey, translations } from "../lib/i18n"

interface LanguageContextType {
  currentLanguage: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey) => string
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(languages[0]) // Default to English

  useEffect(() => {
    // Load saved language from localStorage
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage) {
      const language = languages.find((lang) => lang.code === savedLanguage)
      if (language) {
        setCurrentLanguage(language)
      }
    }
  }, [])

  useEffect(() => {
    // Update document direction and language
    document.documentElement.lang = currentLanguage.code
    document.documentElement.dir = currentLanguage.dir

    // Save to localStorage
    localStorage.setItem("language", currentLanguage.code)
  }, [currentLanguage])

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language)
  }

  const t = (key: TranslationKey): string => {
    return translations[currentLanguage.code as keyof typeof translations]?.[key] || key
  }

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
