import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Tooltip } from './Tooltip'

describe('Tooltip Component', () => {
  it('renders child element properly', () => {
    render(
      <Tooltip content="Gợi ý thao tác">
        <button>Hover Me</button>
      </Tooltip>
    )

    expect(screen.getByText('Hover Me')).toBeInTheDocument()
  })

  it('renders child without tooltip container when disabled', () => {
    render(
      <Tooltip content="Gợi ý" disabled>
        <button>Disabled Tooltip</button>
      </Tooltip>
    )

    expect(screen.getByText('Disabled Tooltip')).toBeInTheDocument()
  })
})
