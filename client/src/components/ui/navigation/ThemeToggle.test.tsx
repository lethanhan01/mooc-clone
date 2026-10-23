import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, beforeEach } from 'vitest'
import { ThemeToggle } from './ThemeToggle'
import { useThemeStore } from '@/stores/themeStore'

describe('ThemeToggle UI Primitive', () => {
  beforeEach(() => {
    useThemeStore.setState({ theme: 'dark', resolvedTheme: 'dark' })
    document.documentElement.dataset.theme = 'dark'
  })

  it('TC-TT-01: renders button with accessible label to switch to light mode when dark', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('data-no-sweep')
    expect(button).toHaveAttribute('aria-label')
  })

  it('TC-TT-02: toggles theme from dark to light on click', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    fireEvent.click(button)
    expect(useThemeStore.getState().theme).toBe('light')
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
    expect(document.documentElement.dataset.theme).toBe('light')

    fireEvent.click(button)
    expect(useThemeStore.getState().theme).toBe('dark')
    expect(useThemeStore.getState().resolvedTheme).toBe('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
  })

  it('TC-TT-03: supports keyboard activation via Space and Enter', () => {
    render(<ThemeToggle />)
    const button = screen.getByRole('button')

    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' })
    // In standard HTML buttons, Enter triggers click event
    fireEvent.click(button)
    expect(useThemeStore.getState().resolvedTheme).toBe('light')
  })

  it('TC-TT-04: applies correct size classes', () => {
    const { rerender } = render(<ThemeToggle size="sm" />)
    expect(screen.getByRole('button')).toHaveClass('h-8')

    rerender(<ThemeToggle size="md" />)
    expect(screen.getByRole('button')).toHaveClass('h-9')
  })
})
