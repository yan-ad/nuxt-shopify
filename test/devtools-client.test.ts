import { describe, expect, it, vi } from 'vitest'
import {
  fetchDevtoolsStore,
  findDevtoolsClient
} from '../src/runtime/shared/devtools-client'

describe('DevTools app-owned transport', () => {
  it('uses app authentication and returns only response data', async () => {
    const request = vi.fn(
      async () =>
        new Response(JSON.stringify({ shop: { name: 'Store' } }), {
          headers: { 'Content-Type': 'application/json' }
        })
    )
    expect(
      await fetchDevtoolsStore(
        async () => 'private-token',
        request as typeof fetch
      )
    ).toEqual({ shop: { name: 'Store' } })
    expect(request).toHaveBeenCalledWith(
      '/_shopify/devtools/store',
      expect.objectContaining({
        headers: { Authorization: 'Bearer private-token' },
        signal: expect.any(AbortSignal)
      })
    )
  })
  it('bounds a stalled response body and aborts the request', async () => {
    vi.useFakeTimers()
    let signal: AbortSignal | undefined
    try {
      const request = vi.fn(async (_url, options) => {
        signal = options?.signal as AbortSignal
        return { ok: true, json: () => new Promise(() => {}) } as Response
      }) as unknown as typeof fetch
      const result = fetchDevtoolsStore(async () => 'token', request)
      const assertion = expect(result).rejects.toThrow(
        'store request timed out'
      )
      await vi.advanceTimersByTimeAsync(20000)
      await assertion
      expect(signal?.aborted).toBe(true)
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
  it('bounds stalled token acquisition without making an API call', async () => {
    vi.useFakeTimers()
    try {
      const request = vi.fn()
      const result = fetchDevtoolsStore(() => new Promise(() => {}), request)
      const assertion = expect(result).rejects.toThrow(
        'ID-token request timed out'
      )
      await vi.advanceTimersByTimeAsync(8000)
      await assertion
      expect(request).not.toHaveBeenCalled()
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
  it('selects the outermost same-origin app transport', () => {
    const outer = vi.fn()
    const inner = vi.fn()
    const app = {
      location: { origin: 'https://app.test' },
      __nuxtShopifyDevtoolsStore: outer
    } as unknown as Window
    Object.assign(app, { parent: app })
    const frame = {
      location: { origin: 'https://app.test' },
      parent: app,
      __nuxtShopifyDevtoolsStore: inner
    } as unknown as Window
    expect(findDevtoolsClient(frame, 'https://app.test')).toBe(outer)
    expect(findDevtoolsClient(frame, 'https://other.test')).toBeUndefined()
  })
})
