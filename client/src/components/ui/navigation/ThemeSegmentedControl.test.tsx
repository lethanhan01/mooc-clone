import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { ThemeSegmentedControl } from './ThemeSegmentedControl'
import { useThemeStore } from '@/stores/themeStore'

describe('ThemeSegmentedControl UI Primitive', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' })
    document.documentElement.dataset.theme = 'dark'
  })

  it('TC-SC-01: renders radiogroup with all 3 theme options', () => {
    render(<ThemeSegmentedControl />)
    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toBeInTheDocument()

    const radios = screen.getAllByRole('radio')
    expect(radios).toHaveLength(3)
  })

  it('TC-SC-02: marks current active theme with aria-checked="true"', () => {
    render(<ThemeSegmentedControl />)
    const radios = screen.getAllByRole('radio')

    // Light (0), Dark (1), System (2)
    expect(radios[0]).toHaveAttribute('aria-checked', 'false')
    expect(radios[1]).toHaveAttribute('aria-checked', 'true')
    expect(radios[2]).toHaveAttribute('aria-checked', 'false')
  })

  it('TC-SC-03: clicking option changes theme in store and DOM', () => {
    render(<ThemeSegmentedControl />)
    const radios = screen.getAllByRole('radio')

    // Click Light
    fireEvent.click(radios[0])
    expect(useThemeStore.getState().theme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    // Click System
    fireEvent.click(radios[2])
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('TC-SC-04: supports keyboard navigation using Arrow keys (W3C APG)', () => {
    render(<ThemeSegmentedControl />)
    const radios = screen.getAllByRole('radio')

    // Dark is index 1. Press ArrowRight -> moves to System (index 2)
    fireEvent.keyDown(radios[1], { key: 'ArrowRight' })
    expect(useThemeStore.getState().theme).toBe('system')

    // From System (index 2), ArrowRight wraps around to Light (index 0)
    fireEvent.keyDown(radios[2], { key: 'ArrowRight' })
    expect(useThemeStore.getState().theme).toBe('light')

    // From Light (index 0), ArrowLeft wraps to System (index 2)
    fireEvent.keyDown(radios[0], { key: 'ArrowLeft' })
    expect(useThemeStore.getState().theme).toBe('system')
  })

  it('TC-SC-05: supports fullWidth prop', () => {
    render(<ThemeSegmentedControl fullWidth />)
    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toHaveClass('w-full')
  })
})
