/**
 * Gamepad input normalization and deadzone handling
 */

import type { NormalizedInput, ButtonMapping } from '../types'
export type { ButtonMapping }

// Standard gamepad button indices (XInput layout)
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
 * Default button mapping (standard XInput layout)
 */
export const DEFAULT_BUTTON_MAPPING: ButtonMapping = {
  a: 0,
  b: 1,
  x: 2,
  y: 3,
  lb: 4,
  rb: 5,
  lt: 6,
  rt: 7,
  back: 8,
  start: 9,
  ls: 10,
  rs: 11,
  dpadUp: 12,
  dpadDown: 13,
  dpadLeft: 14,
  dpadRight: 15,
}

/**
 * Known controller mappings
 */
export const KNOWN_MAPPINGS: Record<string, ButtonMapping> = {
  // 8BitDo Ultimate 2C Wireless
  // User reports: Start button = RS click (index 11), RT button acts as Start (index 9)
  // DPad keys are shifted
  '8bitdo ultimate 2c wireless': {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    lb: 4,
    rb: 5,
    lt: 6,
    rt: 7,
    back: 8,
    start: 11,  // Physical Start button = RS click
    ls: 10,
    rs: 9,   // RS click is at index 9 (RT position)
    dpadUp: 12,
    dpadDown: 13,
    dpadLeft: 14,
    dpadRight: 15,
  },
  // 8BitDo Pro 2
  '8bitdo pro 2': {
    a: 0,
    b: 1,
    x: 2,
    y: 3,
    lb: 4,
    rb: 5,
    lt: 6,
    rt: 7,
    back: 8,
    start: 9,
    ls: 10,
    rs: 11,
    dpadUp: 12,
    dpadDown: 13,
    dpadLeft: 14,
    dpadRight: 15,
  },
}

/**
 * Apply deadzone to a single axis value
 */
export function applyDeadzone(value: number, deadzone: number = DEFAULT_DEADZONE): number {
  if (Math.abs(value) < deadzone) return 0
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
 * Detect controller mapping from gamepad ID
 */
export function detectMapping(gamepad: Gamepad): ButtonMapping {
  const id = gamepad.id.toLowerCase()
  for (const [key, mapping] of Object.entries(KNOWN_MAPPINGS)) {
    if (id.includes(key)) {
      console.log('[Input] Detected known mapping for:', key)
      return mapping
    }
  }
  // Check for 8BitDo in general
  if (id.includes('8bitdo')) {
    console.log('[Input] Using generic 8BitDo mapping')
    return KNOWN_MAPPINGS['8bitdo ultimate 2c wireless']
  }
  return DEFAULT_BUTTON_MAPPING
}

/**
 * Normalize raw gamepad input to our standard format
 */
export function normalizeGamepadInput(
  gamepad: Gamepad,
  deadzone: number = DEFAULT_DEADZONE,
  customMapping?: ButtonMapping
): NormalizedInput {
  const axes = gamepad.axes
  const buttons = gamepad.buttons
  
  // Use custom mapping, detected mapping, or default
  const mapping = customMapping || detectMapping(gamepad)

  // Helper to safely get button by mapped index
  const getBtn = (key: keyof ButtonMapping) => {
    const idx = mapping[key]
    return buttons[idx] ? isButtonPressed(buttons[idx]) : false
  }

  // Helper for analog triggers
  const getTrigger = (key: 'lt' | 'rt') => {
    const idx = mapping[key]
    return normalizeTrigger(buttons[idx]?.value ?? 0)
  }

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
      leftTrigger: getTrigger('lt'),
      rightTrigger: getTrigger('rt'),
    },
    buttons: {
      a: getBtn('a'),
      b: getBtn('b'),
      x: getBtn('x'),
      y: getBtn('y'),
      lb: getBtn('lb'),
      rb: getBtn('rb'),
      back: getBtn('back'),
      start: getBtn('start'),
      ls: getBtn('ls'),
      rs: getBtn('rs'),
      dpadUp: getBtn('dpadUp'),
      dpadDown: getBtn('dpadDown'),
      dpadLeft: getBtn('dpadLeft'),
      dpadRight: getBtn('dpadRight'),
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
  while (diff > Math.PI) diff -= 2 * Math.PI
  while (diff < -Math.PI) diff += 2 * Math.PI

  if (Math.abs(diff) < threshold) return 0
  return diff > 0 ? 1 : -1
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
