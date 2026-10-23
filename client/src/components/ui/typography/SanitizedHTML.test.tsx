import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SanitizedHTML } from './SanitizedHTML'

describe('SanitizedHTML Component (SanitizedHTML.tsx)', () => {
  it('strips dangerous <script> tags to eliminate XSS', () => {
    const malicious = '<p>Bình thường</p><script>alert("hacked")</script>'
    const { container } = render(<SanitizedHTML html={malicious} data-testid="sanitized" />)

    expect(screen.getByText('Bình thường')).toBeInTheDocument()
    expect(container.querySelector('script')).toBeNull()
  })

  it('strips inline event handlers like onerror and onload', () => {
    const malicious = '<img src="invalid.jpg" onerror="alert(1)" alt="Ảnh tập luyện" />'
    const { container } = render(<SanitizedHTML html={malicious} />)

    const img = container.querySelector('img')
    expect(img).toBeInTheDocument()
    expect(img?.getAttribute('onerror')).toBeNull()
  })

  it('preserves safe formatting tags such as bold, italic, and paragraphs', () => {
    const safeHtml = '<p>Chào mừng bạn đến với <b>RoGym</b>. <i>Chúc buổi tập vui vẻ!</i></p>'
    const { container } = render(<SanitizedHTML html={safeHtml} />)

    expect(container.querySelector('b')?.textContent).toBe('RoGym')
    expect(container.querySelector('i')?.textContent).toBe('Chúc buổi tập vui vẻ!')
  })
})
