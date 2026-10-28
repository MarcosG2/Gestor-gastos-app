import { describe, expect, it } from 'vitest'
import { sortQueueFifo } from './sync.js'

describe('sortQueueFifo', () => {
  it('ordena por createdAt ascendente', () => {
    const items = [
      { id: 'b', createdAt: 200 },
      { id: 'a', createdAt: 100 },
      { id: 'c', createdAt: 300 },
    ]
    const sorted = sortQueueFifo(items)
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b', 'c'])
  })
})
