import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import '@/lib/i18n'

// Cung cấp Mock mặc định cho C Communication Engine Electron Bridge
if (typeof window !== 'undefined') {
  window.gatewayApi = {
    isDesktop: true,
    request: vi.fn().mockImplementation(() => Promise.resolve({})),
    getStatus: vi.fn().mockResolvedValue({ connected: true, host: '127.0.0.1', port: 9000 }),
    onPush: vi.fn().mockReturnValue(() => {}),
  }
}

afterEach(() => {
  cleanup()
})
