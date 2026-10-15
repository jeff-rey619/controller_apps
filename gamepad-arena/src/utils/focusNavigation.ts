/**
 * Spatial (directional) focus navigation helpers.
 *
 * Given the currently focused element and the set of focusable elements inside a
 * scope, `findNextFocus` picks the best neighbour in a given direction using
 * element geometry, so D-pad / stick input can drive the DOM like a game menu.
 */

export type NavDirection = 'up' | 'down' | 'left' | 'right'

export const NAV_DIRECTIONS: NavDirection[] = ['up', 'down', 'left', 'right']

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

function isFocusable(el: HTMLElement): boolean {
  if (el.hasAttribute('disabled')) return false
  if (el.hidden) return false
  if (el.getAttribute('aria-hidden') === 'true') return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  return true
}

/** All focusable, currently-rendered elements inside `root`, in DOM order. */
export function getFocusableElements(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter(isFocusable)
}

function center(el: HTMLElement): { x: number; y: number } {
  const r = el.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

/**
 * Find the nearest focusable element in `direction` from `current`.
 * Uses a primary-axis distance plus a weighted penalty on the perpendicular
 * offset so neighbours on the same row/column are preferred.
 * Returns null when there is nothing further in that direction.
 */
export function findNextFocus(
  current: HTMLElement,
  candidates: HTMLElement[],
  direction: NavDirection
): HTMLElement | null {
  const origin = center(current)
  let best: HTMLElement | null = null
  let bestScore = Infinity

  for (const el of candidates) {
    if (el === current) continue
    const p = center(el)
    const dx = p.x - origin.x
    const dy = p.y - origin.y

    let primary: number
    let perpendicular: number

    switch (direction) {
      case 'left':
        if (dx >= -1) continue
        primary = -dx
        perpendicular = Math.abs(dy)
        break
      case 'right':
        if (dx <= 1) continue
        primary = dx
        perpendicular = Math.abs(dy)
        break
      case 'up':
        if (dy >= -1) continue
        primary = -dy
        perpendicular = Math.abs(dx)
        break
      case 'down':
      default:
        if (dy <= 1) continue
        primary = dy
        perpendicular = Math.abs(dx)
        break
    }

    const score = primary + perpendicular * 2
    if (score < bestScore) {
      bestScore = score
      best = el
    }
  }

  return best
}
