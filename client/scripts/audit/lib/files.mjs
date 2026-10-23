/**
 * @fileoverview File Discovery & Path Normalization Helpers
 */

import fs from 'node:fs'
import path from 'node:path'

export const ALLOWED_EXTS = new Set(['.ts', '.tsx', '.js', '.mjs', '.css'])

export function normalizePath(relPath) {
  return relPath.replaceAll('\\', '/')
}

export function isTestFile(rel) {
  const normalized = normalizePath(rel)
  return (
    normalized.includes('.test.') ||
    normalized.includes('.spec.') ||
    normalized.startsWith('src/test/') ||
    normalized.startsWith('tests/')
  )
}

export function getTagBlock(lines, idx, maxLines = 8) {
  const endIdx = Math.min(lines.length, idx + maxLines)
  let block = ''
  for (let i = idx; i < endIdx; i++) {
    const current = lines[i]
    block += ` ${current}`
    if (current.includes('>')) {
      break
    }
  }
  return block
}

export function isInsideUseEffect(lines, idx) {
  const before = lines.slice(Math.max(0, idx - 30), idx).join('\n')
  const match = [...before.matchAll(/\buseEffect\s*\(/g)].pop()
  if (!match) return false
  const lastEffectIdx = match.index
  const effectBody = before.slice(lastEffectIdx)
  const isClosed = effectBody.includes('},') || effectBody.includes('})') || /\}[ \t]*[[)]/.test(effectBody)
  return !isClosed
}

export function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles
  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      if (
        entry.name === 'node_modules' ||
        entry.name === 'dist' ||
        entry.name === 'coverage' ||
        entry.name === '.git'
      ) {
        continue
      }
      getAllFiles(fullPath, arrayOfFiles)
    } else {
      const ext = path.extname(entry.name)
      if (ALLOWED_EXTS.has(ext)) {
        arrayOfFiles.push(fullPath)
      }
    }
  }

  return arrayOfFiles
}
