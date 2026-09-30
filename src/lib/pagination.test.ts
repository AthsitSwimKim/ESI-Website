import { describe, expect, it } from 'vitest'

import { clampPage, pageItems } from './pagination'

/**
 * The Projects grid pages on `?page=`, a value anyone can edit in the address bar, so these
 * cover the out-of-range cases as well as the shape of the number row.
 */
describe('pageItems', () => {
  it('lists every page while they fit', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3])
    expect(pageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the middle once there are too many', () => {
    expect(pageItems(1, 12)).toEqual([1, 2, 3, 4, 5, 'gap', 12])
    expect(pageItems(6, 12)).toEqual([1, 'gap', 5, 6, 7, 'gap', 12])
    expect(pageItems(12, 12)).toEqual([1, 'gap', 8, 9, 10, 11, 12])
  })

  it('keeps a constant width so the control does not shuffle', () => {
    for (let page = 1; page <= 12; page++) {
      expect(pageItems(page, 12)).toHaveLength(7)
    }
  })

  it('always includes the current page, the first and the last', () => {
    for (let page = 1; page <= 30; page++) {
      const items = pageItems(page, 30)
      expect(items).toContain(page)
      expect(items[0]).toBe(1)
      expect(items.at(-1)).toBe(30)
    }
  })
})

describe('clampPage', () => {
  it('defaults to the first page', () => {
    expect(clampPage(null, 3)).toBe(1)
    expect(clampPage('', 3)).toBe(1)
    expect(clampPage('abc', 3)).toBe(1)
    expect(clampPage('1.5', 3)).toBe(1)
    expect(clampPage('0', 3)).toBe(1)
    expect(clampPage('-2', 3)).toBe(1)
  })

  it('never points past the last page', () => {
    expect(clampPage('99', 3)).toBe(3)
    // Filtering down to a single page while ?page=3 is still in the URL.
    expect(clampPage('3', 1)).toBe(1)
    expect(clampPage('3', 0)).toBe(1)
  })

  it('keeps a page that is in range', () => {
    expect(clampPage('2', 3)).toBe(2)
  })
})
