"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { getTranslation, type Language, LANGUAGES, LANGUAGE_CODES, LANGUAGE_NATIVE } from "@/lib/i18n"

type LanguageContextType = {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
  langCode: string
  languages: Language[]
  nativeName: (lang: Language) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("English")

  const t = useCallback(
    (key: string) => getTranslation(language, key),
    [language]
  )

  const langCode = LANGUAGE_CODES[language]
  const nativeName = (lang: Language) => LANGUAGE_NATIVE[lang]

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t, langCode, languages: LANGUAGES, nativeName }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}
