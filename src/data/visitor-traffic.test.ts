import { describe, expect, it, vi } from 'vitest'

import { readWebsiteVisitors } from '../../server/visitor-traffic.mjs'

describe('hosting visitor count', () => {
  it('reads the live total using GET without sending a visitor-counting header', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ count: 42 }))
    expect(await readWebsiteVisitors('https://esi-th.com', request)).toBe(42)
    const [url, options] = request.mock.calls[0]
    expect(String(url)).toBe('https://esi-th.com/visitor-count.php')
    expect(options?.method).toBe('GET')
    expect(options?.redirect).toBe('error')
    expect(new Headers(options?.headers).has('X-ESI-Visitor')).toBe(false)
  })

  it('preserves an actual zero and rejects unavailable or malformed totals', async () => {
    for (const count of [0, 1000001]) {
      const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ count }))
      expect(await readWebsiteVisitors('https://esi-th.com/', request)).toBe(count)
    }
    for (const count of [undefined, null, -1, 1.5, '77', Number.MAX_SAFE_INTEGER + 1]) {
      const request = vi.fn<typeof fetch>().mockResolvedValue(Response.json({ count }))
      await expect(readWebsiteVisitors('https://esi-th.com', request)).rejects.toThrow()
    }
    const unavailable = vi.fn<typeof fetch>().mockResolvedValue(new Response(null, { status: 503 }))
    await expect(readWebsiteVisitors('https://esi-th.com', unavailable)).rejects.toThrow()
    const offline = vi.fn<typeof fetch>().mockRejectedValue(new Error('offline'))
    await expect(readWebsiteVisitors('https://esi-th.com', offline)).rejects.toThrow('offline')
  })
})
