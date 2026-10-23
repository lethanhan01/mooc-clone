import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import viCommon from '../locales/vi/common.json'
import viAuth from '../locales/vi/auth.json'
import viMember from '../locales/vi/member.json'
import viTrainer from '../locales/vi/trainer.json'
import viStaff from '../locales/vi/staff.json'
import viOwner from '../locales/vi/owner.json'
import viHome from '../locales/vi/home.json'
import viValidation from '../locales/vi/validation.json'
import viChat from '../locales/vi/chat.json'

import jaCommon from '../locales/ja/common.json'
import jaAuth from '../locales/ja/auth.json'
import jaMember from '../locales/ja/member.json'
import jaTrainer from '../locales/ja/trainer.json'
import jaStaff from '../locales/ja/staff.json'
import jaOwner from '../locales/ja/owner.json'
import jaHome from '../locales/ja/home.json'
import jaValidation from '../locales/ja/validation.json'
import jaChat from '../locales/ja/chat.json'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      vi: {
        common: viCommon, auth: viAuth, member: viMember, trainer: viTrainer,
        staff: viStaff, owner: viOwner, home: viHome, validation: viValidation,
        chat: viChat,
      },
      ja: {
        common: jaCommon, auth: jaAuth, member: jaMember, trainer: jaTrainer,
        staff: jaStaff, owner: jaOwner, home: jaHome, validation: jaValidation,
        chat: jaChat,
      },
    },
    lng: localStorage.getItem('gym-locale') ?? 'vi',
    fallbackLng: 'vi',
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage'],
      lookupLocalStorage: 'gym-locale',
      caches: ['localStorage'],
    },
  })

export default i18n
