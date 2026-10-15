/**
 * Gamepad input normalization and deadzone handling
 */

import type { NormalizedInput } from '../types'

// Standard gamepad button indices
export const BUTTON_INDEX = {
  A: 0,
  B: 1,
  X: 2,
  Y: 3,
  LB: 4,
  RB: 5,
  LT: 6,
  RT: 7,
  BACK: 8,
  START: 9,
  LS: 10,
  RS: 11,
  DPAD_UP: 12,
  DPAD_DOWN: 13,
  DPAD_LEFT: 14,
  DPAD_RIGHT: 15,
  // 16+ vendor specific
} as const

// Standard gamepad axis indices
export const AXIS_INDEX = {
  LEFT_STICK_X: 0,
  LEFT_STICK_Y: 1,
  RIGHT_STICK_X: 2,
  RIGHT_STICK_Y: 3,
  // LT/RT sometimes on axes 4/5 on some browsers
} as const

const DEFAULT_DEADZONE = 0.15
const TRIGGER_THRESHOLD = 0.1

/**
 * Apply deadzone to a single axis value
 */
export function applyDeadzone(value: number, deadzone: number = DEFAULT_DEADZONE): number {
  if (Math.abs(value) < deadzone) return 0
  // Rescale to [0, 1] range outside deadzone
  const sign = value > 0 ? 1 : -1
  return sign * (Math.abs(value) - deadzone) / (1 - deadzone)
}

/**
 * Normalize trigger value (0-1)
 */
export function normalizeTrigger(value: number): number {
  return value > TRIGGER_THRESHOLD ? value : 0
}

/**
 * Check if button is pressed (handles both digital and analog buttons)
 */
export function isButtonPressed(button: GamepadButton): boolean {
  return button.pressed || button.value > 0.5
}

/**
 * Normalize raw gamepad input to our standard format
 */
export function normalizeGamepadInput(
  gamepad: Gamepad,
  deadzone: number = DEFAULT_DEADZONE
): NormalizedInput {
  const axes = gamepad.axes
  const buttons = gamepad.buttons

  return {
    axes: {
      leftStick: {
        x: applyDeadzone(axes[AXIS_INDEX.LEFT_STICK_X] ?? 0, deadzone),
        y: applyDeadzone(axes[AXIS_INDEX.LEFT_STICK_Y] ?? 0, deadzone),
      },
      rightStick: {
        x: applyDeadzone(axes[AXIS_INDEX.RIGHT_STICK_X] ?? 0, deadzone),
        y: applyDeadzone(axes[AXIS_INDEX.RIGHT_STICK_Y] ?? 0, deadzone),
      },
      leftTrigger: normalizeTrigger(axes[4] ?? buttons[BUTTON_INDEX.LT]?.value ?? 0),
      rightTrigger: normalizeTrigger(axes[5] ?? buttons[BUTTON_INDEX.RT]?.value ?? 0),
    },
    buttons: {
      a: isButtonPressed(buttons[BUTTON_INDEX.A]),
      b: isButtonPressed(buttons[BUTTON_INDEX.B]),
      x: isButtonPressed(buttons[BUTTON_INDEX.X]),
      y: isButtonPressed(buttons[BUTTON_INDEX.Y]),
      lb: isButtonPressed(buttons[BUTTON_INDEX.LB]),
      rb: isButtonPressed(buttons[BUTTON_INDEX.RB]),
      back: isButtonPressed(buttons[BUTTON_INDEX.BACK]),
      start: isButtonPressed(buttons[BUTTON_INDEX.START]),
      ls: isButtonPressed(buttons[BUTTON_INDEX.LS]),
      rs: isButtonPressed(buttons[BUTTON_INDEX.RS]),
      dpadUp: isButtonPressed(buttons[BUTTON_INDEX.DPAD_UP]),
      dpadDown: isButtonPressed(buttons[BUTTON_INDEX.DPAD_DOWN]),
      dpadLeft: isButtonPressed(buttons[BUTTON_INDEX.DPAD_LEFT]),
      dpadRight: isButtonPressed(buttons[BUTTON_INDEX.DPAD_RIGHT]),
    },
    rawAxes: [...axes],
    rawButtons: [...buttons],
  }
}

/**
 * Get stick angle in radians (-PI to PI), 0 = right, PI/2 = down
 */
export function getStickAngle(x: number, y: number): number {
  return Math.atan2(y, x)
}

/**
 * Get stick magnitude (0-1)
 */
export function getStickMagnitude(x: number, y: number): number {
  return Math.min(1, Math.sqrt(x * x + y * y))
}

/**
 * Detect rotation direction from angle change
 * Returns: 1 for CW, -1 for CCW, 0 for no significant rotation
 */
export function getRotationDirection(
  prevAngle: number,
  currAngle: number,
  threshold: number = 0.1
): number {
  let diff = currAngle - prevAngle
  // Normalize to [-PI, PI]
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI

  if (Math.abs(diff) < threshold) return 0
  return diff > 0 ? 1 : -1 // Positive = CW (in screen coords where Y is down)
}

/**
 * Calculate angle difference (shortest path)
 */
export function angleDiff(a: number, b: number): number {
  let diff = b - a
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI
  return diff
}

/**
 * Lerp between two angles (shortest path)
 */
export function lerpAngle(a: number, b: number, t: number): number {
  const diff = angleDiff(a, b)
  return a + diff * t
}