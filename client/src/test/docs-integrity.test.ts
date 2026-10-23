import { describe, expect, it } from 'vitest'
import * as path from 'node:path'
import { execSync } from 'node:child_process'

describe('Documentation Integrity & Markdown Path Standards', () => {
  const clientRoot = path.resolve(__dirname, '../..')
  const scriptPath = path.join(clientRoot, 'scripts', 'verify-docs-integrity.mjs')

  it('passes verify-docs-integrity.mjs with zero errors and no forbidden absolute paths', () => {
    const output = execSync(`node "${scriptPath}"`, {
      encoding: 'utf-8',
      cwd: clientRoot,
    })
    expect(output).toContain('[Link Integrity]')
    expect(output).toContain('100% tệp Markdown tuân thủ quy chuẩn')
    expect(output).not.toContain('lỗi toàn vẹn nghiêm trọng')
  })
})
