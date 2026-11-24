import { describe, expect, it, vi } from 'vitest'
import {
  createStandaloneTicket,
  consumeStandaloneTicket,
  standaloneSessionId,
  revokeStandalone
} from '../src/runtime/server/utils/devtools-standalone'

describe('development standalone handoff', () => {
  it('redeems a ticket once and keeps the Shopify session server-side', () => {
    const ticket = createStandaloneTicket('offline_secret-store')
    expect(ticket).not.toContain('secret-store')
    expect(ticket.length).toBeGreaterThan(40)
    const connection = consumeStandaloneTicket(ticket)!
    expect(connection).not.toBe(ticket)
    expect(standaloneSessionId(connection)).toBe('offline_secret-store')
    expect(consumeStandaloneTicket(ticket)).toBeUndefined()
    expect(standaloneSessionId('unknown')).toBeUndefined()
    revokeStandalone(connection)
    expect(standaloneSessionId(connection)).toBeUndefined()
  })
  it('expires handoff tickets after 30 seconds and connections after 30 minutes', () => {
    vi.useFakeTimers()
    try {
      const expired = createStandaloneTicket('offline_store')
      vi.advanceTimersByTime(30001)
      expect(consumeStandaloneTicket(expired)).toBeUndefined()
      const connection = consumeStandaloneTicket(
        createStandaloneTicket('offline_store')
      )!
      vi.advanceTimersByTime(1800001)
      expect(standaloneSessionId(connection)).toBeUndefined()
    } finally {
      vi.useRealTimers()
    }
  })
})
