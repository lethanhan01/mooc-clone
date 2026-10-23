import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Flex, HStack, VStack } from './Flex'

describe('Flex components', () => {
  it('renders default Flex container', () => {
    render(<Flex>Flex Content</Flex>)
    const el = screen.getByText('Flex Content')
    expect(el.tagName).toBe('DIV')
    expect(el.className).toContain('flex')
    expect(el.className).toContain('flex-row')
  })

  it('supports polymorphic as prop', () => {
    render(<Flex as="nav">Nav Content</Flex>)
    expect(screen.getByText('Nav Content').tagName).toBe('NAV')
  })

  it('applies direction, align, justify and gap', () => {
    render(
      <Flex direction="column" align="center" justify="between" gap={4} data-testid="flex-box">
        Items
      </Flex>
    )
    const el = screen.getByTestId('flex-box')
    expect(el.className).toContain('flex-col')
    expect(el.className).toContain('items-center')
    expect(el.className).toContain('justify-between')
    expect(el.className).toContain('gap-4')
  })

  it('HStack renders row with center alignment by default', () => {
    render(<HStack data-testid="hstack">HStack Items</HStack>)
    const el = screen.getByTestId('hstack')
    expect(el.className).toContain('flex-row')
    expect(el.className).toContain('items-center')
    expect(el.className).toContain('gap-3')
  })

  it('VStack renders column with stretch alignment by default', () => {
    render(<VStack data-testid="vstack">VStack Items</VStack>)
    const el = screen.getByTestId('vstack')
    expect(el.className).toContain('flex-col')
    expect(el.className).toContain('items-stretch')
    expect(el.className).toContain('gap-3')
  })
})
