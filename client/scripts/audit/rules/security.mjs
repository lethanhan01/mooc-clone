/**
 * @fileoverview Domain: security (SEC-001, SEC-007, API-007)
 */

import { isTestFile } from '../lib/files.mjs'

export const rules = {
  NO_DANGEROUS_HTML: {
    id: 'NO_DANGEROUS_HTML',
    domain: 'security',
    canonicalId: 'SEC-001',
    docRef: 'SEM-SEC-001',
    severity: 'ERROR',
    description: 'Cấm sử dụng thuộc tính dangerouslySetInnerHTML chưa qua kiểm soát.',
    filter: (rel) => (rel.endsWith('.tsx') || rel.endsWith('.ts')) && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_DANGEROUS_HTML')) return false
      return line.includes('dangerouslySetInnerHTML')
    },
    message: 'Sử dụng thuộc tính dangerouslySetInnerHTML có nguy cơ bảo mật XSS',
  },

  NO_UNSAFE_TARGET_BLANK: {
    id: 'NO_UNSAFE_TARGET_BLANK',
    domain: 'security',
    canonicalId: 'SEC-007',
    docRef: 'SEM-SEC-002',
    severity: 'ERROR',
    description: 'target="_blank" bắt buộc phải đi kèm rel="noopener noreferrer" hoặc rel="noreferrer".',
    filter: (rel) => rel.endsWith('.tsx') && !isTestFile(rel),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_UNSAFE_TARGET_BLANK')) return false
      if (/target=["']_blank["']/.test(line)) {
        const context = lines.slice(Math.max(0, idx - 2), Math.min(lines.length, idx + 3)).join(' ')
        if (!/rel=["'][^"']*(?:noopener|noreferrer)[^"']*["']/.test(context)) {
          return true
        }
      }
      return false
    },
    message: 'target="_blank" thiếu rel="noopener noreferrer" gây lỗ hổng Reverse Tabnabbing',
  },

  NO_HARDCODED_API_URL: {
    id: 'NO_HARDCODED_API_URL',
    domain: 'security',
    canonicalId: 'API-007',
    docRef: 'SEM-SEC-003',
    severity: 'WARNING',
    description: 'Cấm hardcode URL endpoint (/api/v1/..., http://...) trực tiếp trong component UI.',
    filter: (rel) =>
      rel.endsWith('.tsx') &&
      !isTestFile(rel) &&
      !rel.startsWith('src/services/') &&
      !rel.startsWith('src/lib/'),
    checkLine: (line, idx, lines, isExempt) => {
      if (isExempt('NO_HARDCODED_API_URL')) return false
      return /['"`]\/api\/v1\//.test(line)
    },
    message: 'Hardcode chuỗi endpoint API (/api/v1/...) trong component UI. Bắt buộc gọi qua tầng services.',
  },
}
