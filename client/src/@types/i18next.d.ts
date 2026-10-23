import type viCommon from '../locales/vi/common.json'
import type viAuth from '../locales/vi/auth.json'
import type viMember from '../locales/vi/member.json'
import type viTrainer from '../locales/vi/trainer.json'
import type viStaff from '../locales/vi/staff.json'
import type viOwner from '../locales/vi/owner.json'
import type viHome from '../locales/vi/home.json'
import type viValidation from '../locales/vi/validation.json'
import type viChat from '../locales/vi/chat.json'

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof viCommon
      auth: typeof viAuth
      member: typeof viMember
      trainer: typeof viTrainer
      staff: typeof viStaff
      owner: typeof viOwner
      home: typeof viHome
      validation: typeof viValidation
      chat: typeof viChat
    }
  }
}
