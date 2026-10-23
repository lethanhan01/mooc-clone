import { createRef } from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  AccordionGroup,
} from './Accordion'

describe('Accordion Component', () => {
  it('expands and collapses single item on click', () => {
    render(
      <Accordion type="single" defaultValue="faq-1">
        <AccordionItem value="faq-1">
          <AccordionTrigger>Câu hỏi 1</AccordionTrigger>
          <AccordionContent>Nội dung câu trả lời 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="faq-2">
          <AccordionTrigger>Câu hỏi 2</AccordionTrigger>
          <AccordionContent>Nội dung câu trả lời 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Nội dung câu trả lời 1')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung câu trả lời 2')).not.toBeInTheDocument()

    const trigger2 = screen.getByRole('button', { name: /Câu hỏi 2/i })
    fireEvent.click(trigger2)

    expect(screen.getByText('Nội dung câu trả lời 2')).toBeInTheDocument()
    expect(screen.queryByText('Nội dung câu trả lời 1')).not.toBeInTheDocument()
  })

  it('supports multiple open items when type is multiple', () => {
    render(
      <Accordion type="multiple" defaultValue={['item-1', 'item-2']}>
        <AccordionItem value="item-1">
          <AccordionTrigger>Mục 1</AccordionTrigger>
          <AccordionContent>Nội dung 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Mục 2</AccordionTrigger>
          <AccordionContent>Nội dung 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(screen.getByText('Nội dung 1')).toBeInTheDocument()
    expect(screen.getByText('Nội dung 2')).toBeInTheDocument()
  })

  it('renders data-driven AccordionGroup helper', () => {
    const items = [
      { value: 'plan-1', title: 'Giáo án ngực', content: 'Chi tiết bài tập ngực' },
      { value: 'plan-2', title: 'Giáo án chân', content: 'Chi tiết bài tập chân' },
    ]

    render(<AccordionGroup items={items} defaultValue="plan-1" />)

    expect(screen.getByText('Giáo án ngực')).toBeInTheDocument()
    expect(screen.getByText('Chi tiết bài tập ngực')).toBeInTheDocument()
    expect(screen.queryByText('Chi tiết bài tập chân')).not.toBeInTheDocument()
  })

  it('supports forwardRef for Accordion, AccordionTrigger and AccordionGroup', () => {
    const accordionRef = createRef<HTMLDivElement>()
    const triggerRef = createRef<HTMLButtonElement>()
    const groupRef = createRef<HTMLDivElement>()

    render(
      <Accordion ref={accordionRef} defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger ref={triggerRef}>Trigger Ref</AccordionTrigger>
          <AccordionContent>Content Ref</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    expect(accordionRef.current).toBeInstanceOf(HTMLDivElement)
    expect(triggerRef.current).toBeInstanceOf(HTMLButtonElement)

    render(
      <AccordionGroup
        ref={groupRef}
        items={[{ value: 'g1', title: 'Group 1', content: 'C1' }]}
      />
    )
    expect(groupRef.current).toBeInstanceOf(HTMLDivElement)
  })

  it('supports ArrowDown and ArrowUp keyboard navigation across triggers', () => {
    render(
      <Accordion defaultValue="item-1">
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger 1</AccordionTrigger>
          <AccordionContent>Content 1</AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Trigger 2</AccordionTrigger>
          <AccordionContent>Content 2</AccordionContent>
        </AccordionItem>
      </Accordion>
    )

    const trigger1 = screen.getByRole('button', { name: /Trigger 1/i })
    const trigger2 = screen.getByRole('button', { name: /Trigger 2/i })

    trigger1.focus()
    expect(document.activeElement).toBe(trigger1)

    fireEvent.keyDown(trigger1, { key: 'ArrowDown' })
    expect(document.activeElement).toBe(trigger2)

    fireEvent.keyDown(trigger2, { key: 'ArrowUp' })
    expect(document.activeElement).toBe(trigger1)
  })

  it('supports compound dot notation (Accordion.Item, Accordion.Trigger, Accordion.Content)', () => {
    render(
      <Accordion defaultValue="c-1">
        <Accordion.Item value="c-1">
          <Accordion.Trigger>Compound 1</Accordion.Trigger>
          <Accordion.Content>Nội dung compound 1</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    )

    expect(screen.getByText('Compound 1')).toBeInTheDocument()
    expect(screen.getByText('Nội dung compound 1')).toBeInTheDocument()
  })
})

