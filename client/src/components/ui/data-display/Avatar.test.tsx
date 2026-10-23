import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Avatar, AvatarGroup } from './Avatar'
import { hashTone, type AvatarSize } from './avatar-utils'
import { TONES } from '@/lib/variants'

describe('Avatar Component', () => {
  it('generates initials from full name when image is not provided', () => {
    render(<Avatar name="Nguyễn Văn An" />)
    expect(screen.getByText('NA')).toBeInTheDocument()
  })

  it('generates initials for single-word name', () => {
    render(<Avatar name="Admin" />)
    expect(screen.getByText('AD')).toBeInTheDocument()
  })

  it('falls back to initials when image fails to load', () => {
    render(<Avatar src="https://invalid-image-url.example/test.jpg" name="Trần Bình" />)
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()

    fireEvent.error(img)
    expect(screen.getByText('TB')).toBeInTheDocument()
  })

  it('renders status indicator for all statuses', () => {
    const statuses = ['online', 'busy', 'away', 'offline'] as const
    for (const status of statuses) {
      const { unmount } = render(<Avatar name="Coach Mike" status={status} />)
      expect(screen.getByLabelText(`Status: ${status}`)).toBeInTheDocument()
      unmount()
    }
  })

  it('supports all semantic tones explicitly', () => {
    for (const tone of TONES) {
      const { container, unmount } = render(<Avatar name="Test User" tone={tone} />)
      const avatarEl = container.firstChild as HTMLElement
      expect(avatarEl).toBeInTheDocument()
      unmount()
    }
  })

  it('deterministically hashes name to a valid tone when tone="auto"', () => {
    const tone = hashTone('Nguyễn Văn An')
    expect(['accent', 'success', 'info', 'warning', 'danger']).toContain(tone)
    expect(hashTone('Nguyễn Văn An')).toBe(tone)
  })

  it('supports predefined size variants and shapes', () => {
    const sizes: AvatarSize[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', 'hero']
    for (const size of sizes) {
      const { container, unmount } = render(<Avatar name="Size Test" size={size} shape="rounded" />)
      const avatarEl = container.firstChild as HTMLElement
      expect(avatarEl).toHaveClass('rounded-2xl')
      unmount()
    }
  })

  it('renders AvatarGroup with overflow count', () => {
    render(
      <AvatarGroup max={2}>
        <Avatar name="User 1" />
        <Avatar name="User 2" />
        <Avatar name="User 3" />
        <Avatar name="User 4" />
      </AvatarGroup>
    )

    expect(screen.getByText('U1')).toBeInTheDocument()
    expect(screen.getByText('U2')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
  })

  it('supports forwardRef for Avatar and AvatarGroup', () => {
    const avatarRef = createRef<HTMLDivElement>()
    const groupRef = createRef<HTMLDivElement>()

    render(
      <AvatarGroup ref={groupRef}>
        <Avatar ref={avatarRef} name="Test User" />
      </AvatarGroup>
    )

    expect(avatarRef.current).toBeInstanceOf(HTMLDivElement)
    expect(groupRef.current).toBeInstanceOf(HTMLDivElement)
  })
})
