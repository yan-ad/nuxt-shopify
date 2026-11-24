import { describe, expect, it, vi } from 'vitest'
import { Session, type Shopify } from '@shopify/shopify-api'
import type { SessionStorage } from '@shopify/shopify-app-session-storage'
import {
  ensureOfflineSession,
  exchangeOfflineSession
} from '../src/runtime/server/utils/offline-session'
import { createAdminApiContext } from '../src/runtime/server/utils/clients'

function session(properties: Partial<Session> = {}) {
  return new Session({
    id: 'offline_test.myshopify.com',
    shop: 'test.myshopify.com',
    state: '',
    isOnline: false,
    scope: 'read_products',
    accessToken: 'old-access',
    ...properties
  })
}
function fixture(initial: Session) {
  let stored = initial
  const replacement = session({
    accessToken: 'new-access',
    expires: new Date(Date.now() + 3600_000),
    refreshToken: 'new-refresh',
    refreshTokenExpires: new Date(Date.now() + 86400_000)
  })
  const storage = {
    loadSession: vi.fn(async () => stored),
    storeSession: vi.fn(async (value: Session) => {
      stored = value
      return true
    })
  } as unknown as SessionStorage
  const refreshToken = vi.fn(async () => ({ session: replacement }))
  const migrateToExpiringToken = vi.fn(async () => ({ session: replacement }))
  const tokenExchange = vi.fn(async () => ({ session: replacement }))
  const api = {
    auth: { refreshToken, migrateToExpiringToken, tokenExchange },
    session: { getOfflineId: () => initial.id },
    config: { scopes: undefined }
  } as unknown as Shopify
  return {
    api,
    storage,
    replacement,
    refreshToken,
    migrateToExpiringToken,
    tokenExchange
  }
}

describe('expiring offline tokens', () => {
  it('migrates a legacy token and persists all returned credentials', async () => {
    const initial = session()
    const f = fixture(initial)
    expect(await ensureOfflineSession(f.api, f.storage, initial)).toBe(
      f.replacement
    )
    expect(f.migrateToExpiringToken).toHaveBeenCalledWith({
      shop: initial.shop,
      nonExpiringOfflineAccessToken: 'old-access'
    })
    expect(f.storage.storeSession).toHaveBeenCalledWith(f.replacement)
  })
  it('refreshes near expiry and deduplicates concurrent renewals', async () => {
    const initial = session({
      expires: new Date(Date.now() + 30_000),
      refreshToken: 'old-refresh',
      refreshTokenExpires: new Date(Date.now() + 86400_000)
    })
    const f = fixture(initial)
    const results = await Promise.all([
      ensureOfflineSession(f.api, f.storage, initial),
      ensureOfflineSession(f.api, f.storage, initial)
    ])
    expect(results).toEqual([f.replacement, f.replacement])
    expect(f.refreshToken).toHaveBeenCalledTimes(1)
    expect(f.refreshToken).toHaveBeenCalledWith({
      shop: initial.shop,
      refreshToken: 'old-refresh'
    })
    await ensureOfflineSession(f.api, f.storage, initial)
    expect(f.refreshToken).toHaveBeenCalledTimes(1)
  })
  it('issues expiring tokens and deduplicates concurrent ID-token exchanges', async () => {
    const f = fixture(session())
    await Promise.all([
      exchangeOfflineSession(
        f.api,
        f.storage,
        'test.myshopify.com',
        'id-token'
      ),
      exchangeOfflineSession(f.api, f.storage, 'test.myshopify.com', 'id-token')
    ])
    expect(f.tokenExchange).toHaveBeenCalledTimes(1)
    expect(f.tokenExchange).toHaveBeenCalledWith(
      expect.objectContaining({ expiring: true, sessionToken: 'id-token' })
    )
  })
  it('rejects expired refresh credentials with a reauthentication response', async () => {
    const initial = session({
      expires: new Date(0),
      refreshToken: 'expired',
      refreshTokenExpires: new Date(0)
    })
    const f = fixture(initial)
    await expect(
      ensureOfflineSession(f.api, f.storage, initial)
    ).rejects.toMatchObject({ status: 401 })
    expect(f.refreshToken).not.toHaveBeenCalled()
  })
  it('does not return tokens if storage fails or the token pair is incomplete', async () => {
    const initial = session()
    const f = fixture(initial)
    vi.mocked(f.storage.storeSession).mockResolvedValue(false)
    await expect(
      ensureOfflineSession(f.api, f.storage, initial)
    ).rejects.toMatchObject({ status: 503 })
    f.migrateToExpiringToken.mockResolvedValue({ session: initial })
    await expect(
      ensureOfflineSession(f.api, f.storage, initial)
    ).rejects.toMatchObject({ status: 502 })
  })
  it('requires reauthentication on invalid refresh, but preserves transient failures', async () => {
    const initial = session({
      expires: new Date(0),
      refreshToken: 'refresh',
      refreshTokenExpires: new Date(Date.now() + 86400_000)
    })
    const f = fixture(initial)
    f.refreshToken.mockRejectedValueOnce({ response: { code: 401 } })
    await expect(
      ensureOfflineSession(f.api, f.storage, initial)
    ).rejects.toMatchObject({ status: 401 })
    const transient = new Error('network unavailable')
    f.refreshToken.mockRejectedValueOnce(transient)
    await expect(ensureOfflineSession(f.api, f.storage, initial)).rejects.toBe(
      transient
    )
    expect(f.storage.storeSession).not.toHaveBeenCalled()
  })
  it('renews before constructing an Admin API client', async () => {
    const initial = session()
    const f = fixture(initial)
    const request = vi.fn(async () => ({ data: { shop: { name: 'Test' } } }))
    const constructed = vi.fn()
    f.api.clients = {
      Graphql: class {
        request = request
        constructor(options: { session: Session }) {
          constructed(options.session.accessToken)
        }
      }
    } as unknown as Shopify['clients']
    await createAdminApiContext(f.api, initial, undefined, f.storage).graphql(
      '{ shop { name } }'
    )
    expect(constructed).toHaveBeenCalledWith('new-access')
    expect(request).toHaveBeenCalledTimes(1)
  })
  it('leaves online tokens untouched', async () => {
    const initial = session({ isOnline: true })
    const f = fixture(initial)
    expect(await ensureOfflineSession(f.api, f.storage, initial)).toBe(initial)
    expect(f.storage.loadSession).not.toHaveBeenCalled()
  })
})
