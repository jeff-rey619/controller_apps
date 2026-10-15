import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import * as matchers from '@testing-library/jest-dom/matchers'

expect.extend(matchers)

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

// Mock Gamepad API
const mockGamepad = {
  id: 'Standard Gamepad',
  index: 0,
  connected: true,
  timestamp: performance.now(),
  mapping: 'standard',
  axes: [0, 0, 0, 0],
  buttons: Array(17).fill(null).map(() => ({ pressed: false, value: 0, touched: false })),
  vibrationActuator: null as unknown as Gamepad['vibrationActuator'],
}

Object.defineProperty(navigator, 'getGamepads', {
  writable: true,
  value: vi.fn(() => [mockGamepad, null, null, null]),
})

// Mock requestAnimationFrame
window.requestAnimationFrame = vi.fn((cb) => setTimeout(cb, 16))
window.cancelAnimationFrame = vi.fn((id) => clearTimeout(id))
