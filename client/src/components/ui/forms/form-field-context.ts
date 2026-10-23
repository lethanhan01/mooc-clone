import { createContext, useContext } from 'react'

export interface FormFieldContextValue {
  id: string
  errorId: string
  hintId: string
  hasError: boolean
  error?: string | null
  required?: boolean
  disabled?: boolean
}

export const FormFieldContext = createContext<FormFieldContextValue | null>(null)

export function useFormField() {
  return useContext(FormFieldContext)
}
