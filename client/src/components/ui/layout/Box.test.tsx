import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Box } from './Box'

describe('Box component', () => {
  it('renders a default div with content', () => {
    render(<Box>Box Content</Box>)
    const element = screen.getByText('Box Content')
    expect(element.tagName).toBe('DIV')
  })

  it('renders semantic HTML tags using as prop', () => {
    const { rerender } = render(<Box as="section">Section Content</Box>)
    expect(screen.getByText('Section Content').tagName).toBe('SECTION')

    rerender(<Box as="article">Article Content</Box>)
    expect(screen.getByText('Article Content').tagName).toBe('ARTICLE')

    rerender(<Box as="aside">Aside Content</Box>)
    expect(screen.getByText('Aside Content').tagName).toBe('ASIDE')

    rerender(<Box as="header">Header Content</Box>)
    expect(screen.getByText('Header Content').tagName).toBe('HEADER')

    rerender(<Box as="footer">Footer Content</Box>)
    expect(screen.getByText('Footer Content').tagName).toBe('FOOTER')
  })

  it('applies surface and padding variants correctly', () => {
    render(
      <Box surface="card" padding="md" border="subtle" rounded="xl" data-testid="box-variant">
        Card Box
      </Box>
    )
    const element = screen.getByTestId('box-variant')
    expect(element.className).toContain('bg-bg-elevated')
    expect(element.className).toContain('p-4')
    expect(element.className).toContain('border-border-subtle')
    expect(element.className).toContain('rounded-xl')
  })

  it('merges custom className cleanly', () => {
    render(<Box className="custom-test-class">Custom Class</Box>)
    expect(screen.getByText('Custom Class').className).toContain('custom-test-class')
  })
})
