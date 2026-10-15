import { describe, it, expect, beforeEach } from 'vitest'
import { getFocusableElements, findNextFocus } from './focusNavigation'

function stubRect(el: HTMLElement, left: number, top: number, width: number, height: number) {
  el.getBoundingClientRect = () =>
    ({
      left,
      top,
      width,
      height,
      right: left + width,
      bottom: top + height,
      x: left,
      y: top,
      toJSON: () => ({}),
    }) as DOMRect
}

describe('getFocusableElements', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('collects rendered, enabled, non-hidden controls in DOM order', () => {
    document.body.innerHTML = `
      <div id="scope">
        <button id="a">A</button>
        <button id="b" disabled>B</button>
        <button id="c" hidden>C</button>
        <input id="d" />
        <div id="e" tabindex="0"></div>
        <div id="f" tabindex="-1"></div>
      </div>`

    const scope = document.getElementById('scope') as HTMLElement
    expect(getFocusableElements(scope).map((el) => el.id)).toEqual(['a', 'd', 'e'])
  })

  it('skips aria-hidden elements', () => {
    document.body.innerHTML = `
      <div id="scope">
        <button id="a">A</button>
        <button id="b" aria-hidden="true">B</button>
      </div>`

    const scope = document.getElementById('scope') as HTMLElement
    expect(getFocusableElements(scope).map((el) => el.id)).toEqual(['a'])
  })
})

describe('findNextFocus', () => {
  let items: HTMLElement[]
  let a: HTMLElement
  let b: HTMLElement
  let c: HTMLElement

  beforeEach(() => {
    document.body.innerHTML = `
      <div id="scope">
        <button id="a">A</button>
        <button id="b">B</button>
        <button id="c">C</button>
      </div>`
    const scope = document.getElementById('scope') as HTMLElement
    a = document.getElementById('a') as HTMLElement
    b = document.getElementById('b') as HTMLElement
    c = document.getElementById('c') as HTMLElement
    stubRect(a, 0, 0, 100, 40)
    stubRect(b, 120, 0, 100, 40)
    stubRect(c, 0, 60, 100, 40)
    items = getFocusableElements(scope)
  })

  it('moves right to the same-row neighbour', () => {
    expect(findNextFocus(a, items, 'right')).toBe(b)
  })

  it('moves down to the row below', () => {
    expect(findNextFocus(a, items, 'down')).toBe(c)
  })

  it('moves left back to the previous neighbour', () => {
    expect(findNextFocus(b, items, 'left')).toBe(a)
  })

  it('returns null at the edges', () => {
    expect(findNextFocus(a, items, 'left')).toBeNull()
    expect(findNextFocus(a, items, 'up')).toBeNull()
    expect(findNextFocus(c, items, 'down')).toBeNull()
  })

  it('prefers the aligned neighbour over a diagonal one', () => {
    // From `c` (bottom-left), going right should pick nothing aligned, but from
    // `a` going right must pick `b` rather than the diagonal `c`-less set.
    expect(findNextFocus(a, items, 'right')).toBe(b)
  })
})
