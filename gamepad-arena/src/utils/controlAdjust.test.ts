import { describe, it, expect, beforeEach } from 'vitest'
import { adjustControl } from './controlAdjust'

describe('adjustControl', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('steps a range input with left/right and clamps to bounds', () => {
    document.body.innerHTML = `<input id="r" type="range" min="0" max="1" step="0.01" value="0.5" />`
    const range = document.getElementById('r') as HTMLInputElement

    expect(adjustControl(range, 'right')).toBe(true)
    expect(parseFloat(range.value)).toBeCloseTo(0.51, 5)

    expect(adjustControl(range, 'left')).toBe(true)
    expect(parseFloat(range.value)).toBeCloseTo(0.5, 5)

    range.value = '1'
    adjustControl(range, 'right')
    expect(parseFloat(range.value)).toBe(1)
  })

  it('cycles a select with left/right and clamps at the ends', () => {
    document.body.innerHTML = `
      <select id="s">
        <option value="0">0</option>
        <option value="1">1</option>
        <option value="2">2</option>
      </select>`
    const select = document.getElementById('s') as HTMLSelectElement
    select.selectedIndex = 0

    expect(adjustControl(select, 'right')).toBe(true)
    expect(select.selectedIndex).toBe(1)

    adjustControl(select, 'left')
    expect(select.selectedIndex).toBe(0)

    adjustControl(select, 'left')
    expect(select.selectedIndex).toBe(0)
  })

  it('ignores vertical directions and unrelated elements', () => {
    document.body.innerHTML = `<button id="btn">Go</button><input id="r" type="range" value="5" />`
    const button = document.getElementById('btn') as HTMLElement
    const range = document.getElementById('r') as HTMLInputElement

    expect(adjustControl(button, 'right')).toBe(false)
    expect(adjustControl(range, 'up')).toBe(false)
    expect(range.value).toBe('5')
  })
})
