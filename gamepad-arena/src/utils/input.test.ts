import { describe, it, expect } from 'vitest'
import { applyDeadzone, normalizeTrigger, isButtonPressed, normalizeGamepadInput, getStickAngle, getStickMagnitude, getRotationDirection } from './input'

describe('input utils', () => {
  describe('applyDeadzone', () => {
    it('returns 0 for values within deadzone', () => {
      expect(applyDeadzone(0.1, 0.15)).toBe(0)
      expect(applyDeadzone(-0.1, 0.15)).toBe(0)
    })

    it('rescales values outside deadzone', () => {
      expect(applyDeadzone(0.5, 0.15)).toBeCloseTo(0.4118, 3)
      expect(applyDeadzone(-0.5, 0.15)).toBeCloseTo(-0.4118, 3)
    })

    it('returns 1 for maximum input', () => {
      expect(applyDeadzone(1, 0.15)).toBe(1)
      expect(applyDeadzone(-1, 0.15)).toBe(-1)
    })
  })

  describe('normalizeTrigger', () => {
    it('returns 0 for values below threshold', () => {
      expect(normalizeTrigger(0.05)).toBe(0)
      expect(normalizeTrigger(0.1)).toBe(0)
    })

    it('returns value for values above threshold', () => {
      expect(normalizeTrigger(0.2)).toBe(0.2)
      expect(normalizeTrigger(1)).toBe(1)
    })
  })

  describe('isButtonPressed', () => {
    it('returns true for pressed button', () => {
      expect(isButtonPressed({ pressed: true, value: 0, touched: false })).toBe(true)
    })

    it('returns true for analog button above 0.5', () => {
      expect(isButtonPressed({ pressed: false, value: 0.8, touched: false })).toBe(true)
    })

    it('returns false for unpressed button', () => {
      expect(isButtonPressed({ pressed: false, value: 0, touched: false })).toBe(false)
    })
  })

  describe('normalizeGamepadInput', () => {
    it('normalizes axes and buttons correctly', () => {
      const mockGamepad = {
        id: 'Test Gamepad',
        index: 0,
        connected: true,
        timestamp: performance.now(),
        mapping: 'standard',
        axes: [0.5, -0.5, 0.2, -0.2, 0, 0],
        buttons: Array(17).fill(null).map((_, i) => ({ pressed: i === 0, value: i === 0 ? 1 : 0, touched: false })),
        vibrationActuator: null as unknown as Gamepad['vibrationActuator'],
      }

      const input = normalizeGamepadInput(mockGamepad as Gamepad, 0.15)
      expect(input.axes.leftStick.x).toBeCloseTo(0.4118, 2)
      expect(input.axes.leftStick.y).toBeCloseTo(-0.4118, 2)
      expect(input.buttons.a).toBe(true)
      expect(input.buttons.b).toBe(false)
    })
  })

  describe('getStickAngle', () => {
    it('returns correct angles', () => {
      expect(getStickAngle(1, 0)).toBe(0) // right
      expect(getStickAngle(0, 1)).toBe(Math.PI / 2) // down
      expect(getStickAngle(-1, 0)).toBe(Math.PI) // left
      expect(getStickAngle(0, -1)).toBe(-Math.PI / 2) // up
    })
  })

  describe('getStickMagnitude', () => {
    it('returns correct magnitude', () => {
      expect(getStickMagnitude(0, 0)).toBe(0)
      expect(getStickMagnitude(1, 0)).toBe(1)
      expect(getStickMagnitude(0.6, 0.8)).toBe(1) // clamped at 1
    })
  })

  describe('getRotationDirection', () => {
    it('detects CW rotation', () => {
      expect(getRotationDirection(0, 0.5)).toBe(1)
    })

    it('detects CCW rotation', () => {
      expect(getRotationDirection(0, -0.5)).toBe(-1)
    })

    it('returns 0 for small changes', () => {
      expect(getRotationDirection(0, 0.05)).toBe(0)
    })
  })
})
