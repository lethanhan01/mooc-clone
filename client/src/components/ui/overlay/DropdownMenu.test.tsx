import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from './DropdownMenu'

describe('DropdownMenu Component', () => {
  it('renders trigger button and opens menu on keydown or pointer down', () => {
    const handleItemClick = vi.fn()
    render(
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button>Mở Menu</button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={handleItemClick}>Tùy chọn 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )

    const trigger = screen.getByText('Mở Menu')
    expect(trigger).toBeInTheDocument()

    // Radix dropdown trigger opens with pointerDown or keyboard ArrowDown / Enter
    fireEvent.keyDown(trigger, { key: 'Enter', code: 'Enter' })
    expect(screen.getByText('Tùy chọn 1')).toBeInTheDocument()

    fireEvent.click(screen.getByText('Tùy chọn 1'))
    expect(handleItemClick).toHaveBeenCalledTimes(1)
  })
})
