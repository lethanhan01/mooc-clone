import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from './Sheet'

describe('Sheet Component', () => {
  it('renders trigger and shows drawer content when triggered', () => {
    render(
      <Sheet>
        <SheetTrigger asChild>
          <button>Mở Drawer</button>
        </SheetTrigger>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Drawer Title</SheetTitle>
            <SheetDescription>Drawer Description Text</SheetDescription>
          </SheetHeader>
          <p>Nội dung trong Sheet</p>
        </SheetContent>
      </Sheet>
    )

    const trigger = screen.getByText('Mở Drawer')
    expect(trigger).toBeInTheDocument()

    fireEvent.click(trigger)
    expect(screen.getByText('Drawer Title')).toBeInTheDocument()
    expect(screen.getByText('Drawer Description Text')).toBeInTheDocument()
    expect(screen.getByText('Nội dung trong Sheet')).toBeInTheDocument()
  })
})
