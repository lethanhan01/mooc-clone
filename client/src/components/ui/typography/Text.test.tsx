import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Text } from './Text'

describe('Text component', () => {
  it('renders a default span with body styling', () => {
    render(<Text>Inline Text</Text>)
    const el = screen.getByText('Inline Text')
    expect(el.tagName).toBe('SPAN')
    expect(el.className).toContain('text-base')
    expect(el.className).toContain('text-fg-primary')
  })

  it('supports semantic tags like p, strong, em, small, time', () => {
    const { rerender } = render(<Text as="p">Paragraph</Text>)
    expect(screen.getByText('Paragraph').tagName).toBe('P')

    rerender(<Text as="strong">Strong text</Text>)
    expect(screen.getByText('Strong text').tagName).toBe('STRONG')

    rerender(<Text as="time" dateTime="2026-10-19">Today</Text>)
    expect(screen.getByText('Today').tagName).toBe('TIME')
  })

  it('applies variants, tone, and line clamping', () => {
    render(
      <Text
        variant="caption"
        tone="accent"
        weight="semibold"
        clamp={2}
        data-testid="styled-text"
      >
        Caption styled text
      </Text>
    )
    const el = screen.getByTestId('styled-text')
    expect(el.className).toContain('text-xs')
    expect(el.className).toContain('text-action-accent')
    expect(el.className).toContain('font-semibold')
    expect(el.className).toContain('line-clamp-2')
  })

  it('applies truncate variant', () => {
    render(<Text truncate data-testid="truncated">Truncated text</Text>)
    expect(screen.getByTestId('truncated').className).toContain('truncate')
  })
})
