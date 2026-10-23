import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Grid, GridItem } from './Grid'

describe('Grid components', () => {
  it('renders a default grid with cols and gap', () => {
    render(<Grid cols={2} gap={4} data-testid="grid">Grid Items</Grid>)
    const el = screen.getByTestId('grid')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('grid')
    expect(el.className).toContain('grid-cols-2')
    expect(el.className).toContain('gap-4')
  })

  it('supports responsive breakpoint columns', () => {
    render(
      <Grid cols={1} smCols={2} mdCols={3} lgCols={4} xlCols={6} data-testid="resp-grid">
        Responsive
      </Grid>
    )
    const el = screen.getByTestId('resp-grid')
    expect(el.className).toContain('grid-cols-1')
    expect(el.className).toContain('sm:grid-cols-2')
    expect(el.className).toContain('md:grid-cols-3')
    expect(el.className).toContain('lg:grid-cols-4')
    expect(el.className).toContain('xl:grid-cols-6')
  })

  it('renders semantic tags like section or ul', () => {
    render(
      <Grid as="section" data-testid="section-grid">
        Section
      </Grid>
    )
    expect(screen.getByTestId('section-grid').tagName).toBe('SECTION')
  })

  it('GridItem supports colSpan full or numeric', () => {
    render(
      <Grid cols={3}>
        <GridItem colSpan={2} data-testid="item-span-2">Span 2</GridItem>
        <GridItem colSpan="full" data-testid="item-span-full">Span Full</GridItem>
      </Grid>
    )
    expect(screen.getByTestId('item-span-2').className).toContain('col-span-2')
    expect(screen.getByTestId('item-span-full').className).toContain('col-span-full')
  })
})
