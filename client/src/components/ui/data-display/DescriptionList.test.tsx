import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import {
  DescriptionList,
  DescriptionItem,
  DescriptionTerm,
  DescriptionDetails,
} from './DescriptionList'

describe('DescriptionList component', () => {
  it('renders a dl element with compound subcomponents', () => {
    render(
      <DescriptionList data-testid="dl">
        <DescriptionItem>
          <DescriptionTerm>Body Part</DescriptionTerm>
          <DescriptionDetails>Chest</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    )
    const dl = screen.getByTestId('dl')
    expect(dl.tagName).toBe('DL')
    expect(screen.getByText('Body Part').tagName).toBe('DT')
    expect(screen.getByText('Chest').tagName).toBe('DD')
  })

  it('renders items via shorthand items prop', () => {
    const items = [
      { id: 'bp', term: 'Body Part', details: 'Back' },
      { id: 'eq', term: 'Equipment', details: 'Barbell' },
    ]
    render(<DescriptionList items={items} columns={2} data-testid="shorthand-dl" />)
    expect(screen.getByText('Body Part')).toBeInTheDocument()
    expect(screen.getByText('Back')).toBeInTheDocument()
    expect(screen.getByText('Equipment')).toBeInTheDocument()
    expect(screen.getByText('Barbell')).toBeInTheDocument()
  })

  it('applies grid and border variants', () => {
    render(
      <DescriptionList
        layout="grid"
        columns={2}
        bordered
        data-testid="styled-dl"
      >
        <DescriptionItem>
          <DescriptionTerm>Term</DescriptionTerm>
          <DescriptionDetails>Details</DescriptionDetails>
        </DescriptionItem>
      </DescriptionList>
    )
    const dl = screen.getByTestId('styled-dl')
    expect(dl.className).toContain('grid')
    expect(dl.className).toContain('border-t')
    expect(dl.className).toContain('border-border-subtle')
  })
})
