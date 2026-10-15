/**
 * Value adjustment for form controls that can't be driven by focus alone.
 *
 * A gamepad can't open a native <select> popup or drag a slider, so left/right
 * on a focused range/select adjusts its value directly and dispatches the
 * events React listens for.
 */

import type { NavDirection } from './focusNavigation'

/** Set a React-controlled input's value through the native setter so onChange fires. */
function setNativeValue(input: HTMLInputElement, value: string): void {
  const descriptor = Object.getOwnPropertyDescriptor(
    Object.getPrototypeOf(input),
    'value'
  )
  descriptor?.set?.call(input, value)
  input.dispatchEvent(new Event('input', { bubbles: true }))
  input.dispatchEvent(new Event('change', { bubbles: true }))
}

/**
 * Adjust the focused control with a horizontal direction.
 * Returns true when the control consumed the input (so focus should not move).
 */
export function adjustControl(el: HTMLElement, direction: NavDirection): boolean {
  if (direction !== 'left' && direction !== 'right') return false
  const delta = direction === 'right' ? 1 : -1

  if (el instanceof HTMLSelectElement) {
    const next = el.selectedIndex + delta
    if (next < 0 || next >= el.options.length) return true
    el.selectedIndex = next
    el.dispatchEvent(new Event('change', { bubbles: true }))
    return true
  }

  if (el instanceof HTMLInputElement && el.type === 'range') {
    const min = parseFloat(el.min)
    const max = parseFloat(el.max)
    const step = parseFloat(el.step) || 1
    const current = parseFloat(el.value)
    let next = current + delta * step
    if (!Number.isNaN(min)) next = Math.max(min, next)
    if (!Number.isNaN(max)) next = Math.min(max, next)
    setNativeValue(el, String(Number(next.toFixed(4))))
    return true
  }

  return false
}
