import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn utility (utils.ts)', () => {
  it('merges multiple class strings properly', () => {
    expect(cn('bg-red-500', 'text-white')).toBe('bg-red-500 text-white')
  })

  it('handles conditional and falsy values', () => {
    expect(cn('base', false && 'hidden', null, undefined, 0 && 'zero', 'active')).toBe(
      'base active'
    )
  })

  it('resolves conflicting tailwind classes with tailwind-merge', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4')
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500')
  })

  it('handles nested arrays and object format', () => {
    expect(cn(['btn', ['btn-primary', { 'btn-large': true, 'btn-disabled': false }]])).toBe(
      'btn btn-primary btn-large'
    )
  })
})
