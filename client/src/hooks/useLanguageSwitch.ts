import { useState, useCallback, useEffect } from 'react'
import i18n from '@/lib/i18n'

export type SupportedLanguage = 'vi' | 'ja' | 'en'

const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur'])

export function useLanguageSwitch(): {
  currentLanguage: string
  changeLanguage: (lang: SupportedLanguage) => Promise<void>
  isRTL: boolean
} {
  const [currentLanguage, setCurrentLanguage] = useState<string>(() => i18n.language || 'vi')

  const isRTL = RTL_LANGUAGES.has(currentLanguage)

  const syncDocumentAttributes = useCallback((lang: string) => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
      document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr'
    }
  }, [])

  const changeLanguage = useCallback(
    async (lang: SupportedLanguage) => {
      await i18n.changeLanguage(lang)
      setCurrentLanguage(lang)
      syncDocumentAttributes(lang)
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('gym-locale', lang)
      }
    },
    [syncDocumentAttributes]
  )

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setCurrentLanguage(lng)
      syncDocumentAttributes(lng)
    }

    syncDocumentAttributes(i18n.language || 'vi')
    i18n.on('languageChanged', handleLanguageChanged)
    return () => {
      i18n.off('languageChanged', handleLanguageChanged)
    }
  }, [syncDocumentAttributes])

  return {
    currentLanguage,
    changeLanguage,
    isRTL,
  }
}
