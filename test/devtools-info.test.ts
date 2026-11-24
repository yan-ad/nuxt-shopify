import { describe, expect, it } from 'vitest'
import { Session } from '@shopify/shopify-api'
import type { ResolvedConfig } from '../src/runtime/types'
import { getDevtoolsInfo } from '../src/runtime/server/utils/devtools-info'

describe('Shopify DevTools inspector', () => {
  it('allowlists metadata and never serializes credentials', () => {
    const session = new Session({
      id: 'offline_store',
      shop: 'test.myshopify.com',
      state: 'secret-state',
      isOnline: false,
      accessToken: 'secret-access',
      refreshToken: 'secret-refresh',
      expires: new Date('2027-01-01'),
      refreshTokenExpires: new Date('2027-02-01'),
      scope: 'read_products'
    })
    const config = {
      apiKey: 'private-key',
      apiSecretKey: 'private-secret',
      apiVersion: '2026-01',
      appUrl: 'https://app.test',
      scopes: ['read_products'],
      distribution: 'app_store'
    } as ResolvedConfig
    const info = getDevtoolsInfo(config, session)
    expect(info.session.refreshAvailable).toBe(true)
    expect(info.session.accessTokenExpires).toBe('2027-01-01T00:00:00.000Z')
    const json = JSON.stringify(info)
    for (const secret of [
      'secret-state',
      'secret-access',
      'secret-refresh',
      'private-key',
      'private-secret'
    ])
      expect(json).not.toContain(secret)
  })
})
