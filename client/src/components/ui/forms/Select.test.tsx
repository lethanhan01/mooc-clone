import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectSearchInput,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectEmpty,
} from './Select'
import { FormField } from './FormField'
import {
  normalizeSelectSize,
  filterOptions,
  extractTextFromReactNode,
  useSelectContext,
} from './select-utils'

const mockPackages = [
  { value: 'basic', label: 'Gói Cơ Bản', description: 'Tập gym tự do', searchTerms: ['tự do', 'standard'] },
  { value: 'vip', label: 'Gói VIP', description: 'Kèm huấn luyện viên', searchTerms: ['pt', 'coach'] },
  { value: 'platinum', label: 'Gói Platinum', description: 'Toàn quyền dịch vụ', searchTerms: ['full', 'all'] },
]

describe('Select Primitive', () => {
  describe('Shorthand & Legacy Option Elements', () => {
    it('renders trigger with placeholder and selected value from option tags', () => {
      const handleChange = vi.fn()
      render(
        <Select value="basic" onValueChange={handleChange} ariaLabel="Chọn gói">
          <option value="">-- Chọn gói tập --</option>
          <option value="basic">Gói Cơ Bản</option>
          <option value="vip">Gói VIP</option>
        </Select>
      )

      const trigger = screen.getByRole('combobox', { name: 'Chọn gói' })
      expect(trigger).toBeInTheDocument()
      expect(trigger).toHaveTextContent('Gói Cơ Bản')
    })

    it('renders selected value using options prop array', () => {
      render(
        <Select
          options={mockPackages}
          value="vip"
          onValueChange={() => {}}
          placeholder="Chọn gói tập..."
        />
      )
      expect(screen.getByText('Gói VIP')).toBeInTheDocument()
    })

    it('auto-binds accessible attributes when inside FormField', () => {
      render(
        <FormField label="Gói dịch vụ" error="Vui lòng chọn gói" required>
          <Select value="" onValueChange={() => {}}>
            <option value="">Chọn gói</option>
            <option value="pkg-1">Gói 1</option>
          </Select>
        </FormField>
      )

      const label = screen.getByText('Gói dịch vụ').closest('label')
      const trigger = screen.getByRole('combobox')
      const errorAlert = screen.getByRole('alert')

      expect(label).toHaveAttribute('for', trigger.id)
      expect(trigger).toHaveAttribute('aria-invalid', 'true')
      expect(trigger).toHaveAttribute('aria-describedby', errorAlert.id)
      expect(errorAlert).toHaveTextContent('Vui lòng chọn gói')
    })

    it('binds hintId when FormField has hint and no error', () => {
      render(
        <FormField label="Dịch vụ" hint="Chọn gói phù hợp với bạn">
          <Select value="" onValueChange={() => {}}>
            <option value="1">Gói 1</option>
          </Select>
        </FormField>
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-describedby')
      expect(trigger).toHaveAttribute('aria-invalid', 'false')
    })

    it('supports size variants and disabled state', () => {
      const { rerender } = render(
        <Select value="" onValueChange={() => {}} size="sm" ariaLabel="Nhỏ">
          <option value="1">1</option>
        </Select>
      )
      expect(screen.getByRole('combobox')).toHaveClass('min-h-[36px]')

      rerender(
        <Select value="" onValueChange={() => {}} size="lg" ariaLabel="Lớn">
          <option value="1">1</option>
        </Select>
      )
      expect(screen.getByRole('combobox')).toHaveClass('min-h-[50px]')

      rerender(
        <Select value="" onValueChange={() => {}} disabled ariaLabel="Bị khóa">
          <option value="1">1</option>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeDisabled()
    })

    it('renders hidden input for native form submission when name is provided', () => {
      const { container } = render(
        <form>
          <Select name="packageId" value="pkg-123" onValueChange={() => {}}>
            <option value="pkg-123">Gói 123</option>
          </Select>
        </form>
      )
      const formControl = container.querySelector('[name="packageId"]')
      expect(formControl).toHaveValue('pkg-123')
    })

    it('supports uncontrolled mode with defaultValue', () => {
      const handleChange = vi.fn()
      render(
        <Select
          searchable
          defaultValue="basic"
          options={mockPackages}
          onValueChange={handleChange}
        />
      )
      expect(screen.getByText('Gói Cơ Bản')).toBeInTheDocument()
    })
  })

  describe('Searchable Mode (Dual-Engine Popover)', () => {
    it('opens popover on click and filters results by label, description and searchTerms', () => {
      render(
        <Select
          searchable
          options={mockPackages}
          placeholder="Tìm gói..."
          searchPlaceholder="Gõ để tìm..."
        />
      )

      const trigger = screen.getByRole('combobox')
      fireEvent.click(trigger)

      expect(screen.getByText('Gói Cơ Bản')).toBeInTheDocument()
      expect(screen.getByText('Gói VIP')).toBeInTheDocument()
      expect(screen.getByText('Gói Platinum')).toBeInTheDocument()

      const searchInput = screen.getByPlaceholderText('Gõ để tìm...')

      // Lọc theo description: "huấn luyện viên"
      fireEvent.change(searchInput, { target: { value: 'huấn luyện' } })
      expect(screen.getByText('Gói VIP')).toBeInTheDocument()
      expect(screen.queryByText('Gói Cơ Bản')).not.toBeInTheDocument()

      // Lọc theo searchTerms: "all"
      fireEvent.change(searchInput, { target: { value: 'all' } })
      expect(screen.getByText('Gói Platinum')).toBeInTheDocument()
      expect(screen.queryByText('Gói VIP')).not.toBeInTheDocument()
    })

    it('selects option on click and invokes onValueChange and onChange', () => {
      const handleValueChange = vi.fn()
      const handleChange = vi.fn()
      render(
        <Select
          searchable
          options={mockPackages}
          placeholder="Chọn gói..."
          onValueChange={handleValueChange}
          onChange={handleChange}
        />
      )

      fireEvent.click(screen.getByRole('combobox'))
      fireEvent.click(screen.getByText('Gói VIP'))

      expect(handleValueChange).toHaveBeenCalledWith('vip')
      expect(handleChange).toHaveBeenCalledWith('vip')
    })

    it('shows empty text when search matches nothing', () => {
      render(
        <Select
          searchable
          options={mockPackages}
          emptyText="Không có dữ liệu phù hợp"
        />
      )

      fireEvent.click(screen.getByRole('combobox'))
      const searchInput = screen.getByPlaceholderText('Tìm kiếm...')
      fireEvent.change(searchInput, { target: { value: 'xyz123456' } })

      expect(screen.getByText('Không có dữ liệu phù hợp')).toBeInTheDocument()
    })

    it('clears value when clear button is clicked without opening popover', () => {
      const handleValueChange = vi.fn()
      render(
        <Select
          searchable
          options={mockPackages}
          value="basic"
          clearable
          onValueChange={handleValueChange}
        />
      )

      const clearBtn = screen.getByLabelText('Xóa lựa chọn')
      expect(clearBtn).toBeInTheDocument()

      fireEvent.click(clearBtn)
      expect(handleValueChange).toHaveBeenCalledWith('')
    })
  })

  describe('Compound Sub-components API', () => {
    it('renders compound syntax in standard select engine', () => {
      render(
        <Select value="item-1" onValueChange={() => {}}>
          <Select.Trigger ariaLabel="Bộ chọn">
            <Select.Value placeholder="Chọn dịch vụ" />
          </Select.Trigger>
          <Select.Content>
            <Select.Group label="Nhóm dịch vụ">
              <Select.Item value="item-1">Dịch vụ 1</Select.Item>
              <Select.Item value="item-2">Dịch vụ 2</Select.Item>
            </Select.Group>
            <Select.Separator />
            <Select.Empty>Trống</Select.Empty>
          </Select.Content>
        </Select>
      )

      expect(screen.getByRole('combobox', { name: 'Bộ chọn' })).toBeInTheDocument()
    })

    it('renders compound syntax with searchable engine', () => {
      const handleSelect = vi.fn()
      render(
        <Select searchable value="" onValueChange={handleSelect}>
          <SelectTrigger ariaLabel="Bộ chọn tìm kiếm">
            <SelectValue placeholder="Chọn gói" />
          </SelectTrigger>
          <SelectContent>
            <SelectSearchInput placeholder="Nhập tên..." />
            <SelectGroup label="Gói PT">
              <SelectItem value="pt-1">10 buổi PT</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectEmpty>Không có kết quả</SelectEmpty>
          </SelectContent>
        </Select>
      )

      fireEvent.click(screen.getByRole('combobox', { name: 'Bộ chọn tìm kiếm' }))
      expect(screen.getByPlaceholderText('Nhập tên...')).toBeInTheDocument()
      expect(screen.getByText('10 buổi PT')).toBeInTheDocument()

      fireEvent.click(screen.getByText('10 buổi PT'))
      expect(handleSelect).toHaveBeenCalledWith('pt-1')
    })
  })

  describe('Pure Helpers (select-utils.ts)', () => {
    it('normalizeSelectSize returns valid sizes and defaults to md', () => {
      expect(normalizeSelectSize('sm')).toBe('sm')
      expect(normalizeSelectSize('lg')).toBe('lg')
      expect(normalizeSelectSize('md')).toBe('md')
      expect(normalizeSelectSize(undefined)).toBe('md')
      expect(normalizeSelectSize('invalid-size')).toBe('md')
    })

    it('filterOptions returns original array when search query is empty', () => {
      expect(filterOptions(mockPackages, '')).toBe(mockPackages)
      expect(filterOptions(mockPackages, '   ')).toBe(mockPackages)
    })

    it('extractTextFromReactNode joins nested array elements without commas', () => {
      expect(extractTextFromReactNode('Hello')).toBe('Hello')
      expect(extractTextFromReactNode(42)).toBe('42')
      expect(extractTextFromReactNode(['MEM001', ' - ', 'Nguyen Van A'])).toBe('MEM001 - Nguyen Van A')
      expect(extractTextFromReactNode(null)).toBe('')
    })

    it('useSelectContext throws helpful error when called outside Select root', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      function OrphanComponent() {
        useSelectContext()
        return null
      }
      expect(() => render(<OrphanComponent />)).toThrow(
        'Select compound sub-components must be rendered within a <Select> root.'
      )
      consoleError.mockRestore()
    })
  })
})
