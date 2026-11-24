import { describe, expect, it, vi } from 'vitest'
import {
  findDevtoolsBridge,
  withDevtoolsTimeout
} from '../src/runtime/shared/devtools-bridge'

function frame(bridge: unknown, parent?: unknown): Window {
  const value = {
    location: { origin: 'https://app.test' },
    shopify: bridge,
    parent
  } as unknown as Window
  if (!parent) Object.assign(value, { parent: value })
  return value
}

describe('DevTools parent authentication', () => {
  it('selects the outer app bridge instead of a nested DevTools bridge', () => {
    const app = { config: { shop: 'store.myshopify.com' }, idToken: vi.fn() }
    const nested = { config: { shop: 'store.myshopify.com' }, idToken: vi.fn() }
    const admin = {
      get location() {
        throw new Error('Cross origin')
      }
    }
    expect(
      findDevtoolsBridge(frame(nested, frame(app, admin)), 'https://app.test')
    ).toBe(app)
    expect(nested.idToken).not.toHaveBeenCalled()
  })
  it('does not cross origins or return an unrelated bridge', () => {
    expect(
      findDevtoolsBridge(frame(undefined), 'https://app.test')
    ).toBeUndefined()
    expect(
      findDevtoolsBridge(
        frame({ config: { shop: 'store' } }),
        'https://other.test'
      )
    ).toBeUndefined()
  })
  it('bounds stalled token acquisition and clears timers', async () => {
    vi.useFakeTimers()
    try {
      const promise = withDevtoolsTimeout(
        () => new Promise(() => {}),
        100,
        'Timed out'
      )
      const rejection = expect(promise).rejects.toThrow('Timed out')
      await vi.advanceTimersByTimeAsync(100)
      await rejection
      expect(vi.getTimerCount()).toBe(0)
      expect(
        await withDevtoolsTimeout(async () => 'token', 100, 'Timed out')
      ).toBe('token')
      expect(vi.getTimerCount()).toBe(0)
    } finally {
      vi.useRealTimers()
    }
  })
})
