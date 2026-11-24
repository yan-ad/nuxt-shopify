import { describe, expect, it } from 'vitest'
import {
  assertStandaloneOrigin,
  standaloneOrigin
} from '../src/runtime/server/utils/standalone-origin'

describe('standalone origins behind a tunnel', () => {
  it('accepts the configured public HTTPS origin over internal HTTP transport', () => {
    const req = new Request(
      'http://localhost:3000/_shopify/devtools/standalone',
      { method: 'POST', headers: { Origin: 'https://app.trycloudflare.com' } }
    )
    expect(assertStandaloneOrigin(req, 'https://app.trycloudflare.com/')).toBe(
      'https://app.trycloudflare.com'
    )
  })
  it('rejects missing, null, cross-origin and stale tunnel origins', () => {
    for (const origin of [
      '',
      'null',
      'https://evil.test',
      'https://old.trycloudflare.com'
    ]) {
      const req = new Request('http://localhost:3000/api/settings', {
        method: 'PUT',
        headers: origin ? { Origin: origin } : {}
      })
      expect(() =>
        assertStandaloneOrigin(req, 'https://app.trycloudflare.com')
      ).toThrow()
    }
  })
  it('does not trust attacker-controlled forwarded headers', () => {
    const req = new Request('http://localhost:3000/api/settings', {
      method: 'PUT',
      headers: {
        Origin: 'https://evil.test',
        'X-Forwarded-Host': 'evil.test',
        'X-Forwarded-Proto': 'https'
      }
    })
    expect(() =>
      assertStandaloneOrigin(req, 'https://app.trycloudflare.com')
    ).toThrow()
  })
  it('supports direct localhost without public configuration and rejects invalid app URLs', () => {
    expect(standaloneOrigin('http://localhost:3000/path', '')).toBe(
      'http://localhost:3000'
    )
    expect(() =>
      standaloneOrigin('http://localhost:3000/path', 'invalid')
    ).toThrow()
    expect(() => standaloneOrigin('https://public.test/path', '')).toThrow()
  })
})
