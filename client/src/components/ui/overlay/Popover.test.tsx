import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Popover, PopoverTrigger, PopoverContent } from './Popover'

describe('Popover Component', () => {
  it('renders trigger and shows content on interaction', () => {
    render(
      <Popover>
        <PopoverTrigger asChild>
          <button>Mở Popover</button>
        </PopoverTrigger>
        <PopoverContent>
          <p>Nội dung chi tiết trong Popover</p>
        </PopoverContent>
      </Popover>
    )

    const trigger = screen.getByText('Mở Popover')
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Nội dung chi tiết trong Popover')).toBeInTheDocument()
  })
})
