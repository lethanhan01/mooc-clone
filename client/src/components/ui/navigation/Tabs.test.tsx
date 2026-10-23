import { createRef, useState } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Tabs, TabsList, TabsTrigger, TabsContent, TabsBar } from './Tabs'

describe('Tabs Component', () => {
  it('renders compound tabs and switches tab content on click', () => {
    function TestComponent() {
      const [tab, setTab] = useState('account')
      return (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList aria-label="Settings Tabs">
            <TabsTrigger value="account">Tài khoản</TabsTrigger>
            <TabsTrigger value="password">Mật khẩu</TabsTrigger>
          </TabsList>
          <TabsContent value="account">
            <div>Nội dung tài khoản</div>
          </TabsContent>
          <TabsContent value="password">
            <div>Nội dung mật khẩu</div>
          </TabsContent>
        </Tabs>
      )
    }

    render(<TestComponent />)

    expect(screen.getByText('Nội dung tài khoản')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung mật khẩu')).not.toBeInTheDocument()

    const passwordTab = screen.getByRole('tab', { name: 'Mật khẩu' })
    fireEvent.click(passwordTab)

    expect(screen.getByText('Nội dung mật khẩu')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung tài khoản')).not.toBeInTheDocument()
  })

  it('renders data-driven TabsBar component correctly', () => {
    const onChange = vi.fn()
    const items = [
      { value: 'tab1', label: 'Tab 1', badge: '5' },
      { value: 'tab2', label: 'Tab 2', disabled: true },
    ]

    render(<TabsBar items={items} value="tab1" onChange={onChange} variant="segmented" />)

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()

    const tab2 = screen.getByRole('tab', { name: /Tab 2/i })
    expect(tab2).toBeDisabled()

    fireEvent.click(tab2)
    expect(onChange).not.toHaveBeenCalled()
  })

  it('supports forwardRef for Tabs, TabsList, TabsTrigger, TabsContent, and TabsBar', () => {
    const tabsRef = createRef<HTMLDivElement>()
    const listRef = createRef<HTMLDivElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    const contentRef = createRef<HTMLDivElement>()
    const barRef = createRef<HTMLDivElement>()

    render(
      <Tabs ref={tabsRef} defaultValue="t1">
        <TabsList ref={listRef}>
          <TabsTrigger ref={triggerRef} value="t1">Tab 1</TabsTrigger>
        </TabsList>
        <TabsContent ref={contentRef} value="t1">Content 1</TabsContent>
      </Tabs>
    )

    expect(tabsRef.current).toBeInstanceOf(HTMLDivElement)
    expect(listRef.current).toBeInstanceOf(HTMLDivElement)
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement)
    expect(contentRef.current).toBeInstanceOf(HTMLDivElement)

    render(
      <TabsBar
        ref={barRef}
        items={[{ value: 'b1', label: 'Bar 1' }]}
        value="b1"
        onChange={() => {}}
      />
    )
    expect(barRef.current).toBeInstanceOf(HTMLDivElement)
  })

  it('supports ArrowRight and ArrowLeft keyboard navigation across triggers', () => {
    function ControlledTabs() {
      const [tab, setTab] = useState('t1')
      return (
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="t1">Tab 1</TabsTrigger>
            <TabsTrigger value="t2">Tab 2</TabsTrigger>
            <TabsTrigger value="t3">Tab 3</TabsTrigger>
          </TabsList>
        </Tabs>
      )
    }

    render(<ControlledTabs />)

    const tab1 = screen.getByRole('tab', { name: 'Tab 1' })
    const tab2 = screen.getByRole('tab', { name: 'Tab 2' })

    tab1.focus()
    expect(document.activeElement).toBe(tab1)

    fireEvent.keyDown(tab1, { key: 'ArrowRight' })
    expect(document.activeElement).toBe(tab2)
    expect(tab2).toHaveAttribute('aria-selected', 'true')

    fireEvent.keyDown(tab2, { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(tab1)
    expect(tab1).toHaveAttribute('aria-selected', 'true')
  })

  it('supports compound dot notation (Tabs.List, Tabs.Trigger, Tabs.Content)', () => {
    render(
      <Tabs defaultValue="overview">
        <Tabs.List>
          <Tabs.Trigger value="overview">Tổng quan</Tabs.Trigger>
          <Tabs.Trigger value="details">Chi tiết</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="overview">Nội dung tổng quan</Tabs.Content>
        <Tabs.Content value="details">Nội dung chi tiết</Tabs.Content>
      </Tabs>
    )

    expect(screen.getByText('Tổng quan')).toBeInTheDocument()
    expect(screen.getByText('Nội dung tổng quan')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung chi tiết')).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('tab', { name: 'Chi tiết' }))
    expect(screen.getByText('Nội dung chi tiết')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung tổng quan')).not.toBeInTheDocument()
  })
})

