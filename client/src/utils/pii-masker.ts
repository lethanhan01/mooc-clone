/**
 * PII Masker Utility (SEC-004)
 * Provides field-level and recursive data masking for Personally Identifiable Information
 * to comply with data privacy policies and prevent leaking sensitive data in logs/UI.
 */

export type PIIType = 'phone' | 'email' | 'citizenId' | 'bankAccount'

export function maskPhone(phone: string): string {
  if (!phone || typeof phone !== 'string') return ''
  const trimmed = phone.trim()
  if (trimmed.length < 7) return '*'.repeat(trimmed.length)
  const first = trimmed.slice(0, 3)
  const last = trimmed.slice(-3)
  return `${first}****${last}`
}

export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') return ''
  const trimmed = email.trim()
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 1) return '*'.repeat(trimmed.length)

  const name = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex)

  if (name.length <= 2) {
    return `${name[0]}*${domain}`
  }

  const firstChar = name[0]
  const lastChar = name.at(-1) ?? ''
  return `${firstChar}***${lastChar}${domain}`
}

export function maskCitizenId(id: string): string {
  if (!id || typeof id !== 'string') return ''
  const trimmed = id.trim()
  if (trimmed.length < 8) return '*'.repeat(trimmed.length)
  const first = trimmed.slice(0, 4)
  const last = trimmed.slice(-4)
  return `${first}****${last}`
}

export function maskBankAccount(account: string): string {
  if (!account || typeof account !== 'string') return ''
  const trimmed = account.trim()
  if (trimmed.length <= 4) return '*'.repeat(trimmed.length)
  const last = trimmed.slice(-4)
  return `${'*'.repeat(trimmed.length - 4)}${last}`
}

export function maskPII(value: string, type: PIIType): string {
  switch (type) {
    case 'phone':
      return maskPhone(value)
    case 'email':
      return maskEmail(value)
    case 'citizenId':
      return maskCitizenId(value)
    case 'bankAccount':
      return maskBankAccount(value)
    default:
      return value
  }
}

const PII_KEY_PATTERNS = {
  phone: /^(phone|phone_number|phonenumber|mobile|sdt)$/i,
  email: /^(email|email_address|emailaddress)$/i,
  citizenId: /^(citizenid|citizen_id|idcard|id_card|cccd|cmnd)$/i,
  bankAccount: /^(bankaccount|bank_account|accountnumber|account_number|stk)$/i,
}

export function maskObjectPII<T extends Record<string, unknown>>(data: T): T {
  if (!data || typeof data !== 'object') return data
  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === 'object' && item !== null
        ? maskObjectPII(item as Record<string, unknown>)
        : item
    ) as unknown as T
  }

  const result: Record<string, unknown> = {}

  for (const [key, val] of Object.entries(data)) {
    if (typeof val === 'string') {
      if (PII_KEY_PATTERNS.phone.test(key)) {
        result[key] = maskPhone(val)
      } else if (PII_KEY_PATTERNS.email.test(key)) {
        result[key] = maskEmail(val)
      } else if (PII_KEY_PATTERNS.citizenId.test(key)) {
        result[key] = maskCitizenId(val)
      } else if (PII_KEY_PATTERNS.bankAccount.test(key)) {
        result[key] = maskBankAccount(val)
      } else {
        result[key] = val
      }
    } else if (typeof val === 'object' && val !== null) {
      result[key] = maskObjectPII(val as Record<string, unknown>)
    } else {
      result[key] = val
    }
  }

  return result as T
}
