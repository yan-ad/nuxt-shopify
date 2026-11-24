import {
  RequestedTokenType,
  type Session,
  type Shopify
} from '@shopify/shopify-api'
import type { SessionStorage } from '@shopify/shopify-app-session-storage'
import { HTTPError } from 'nitro/h3'

const renewals = new WeakMap<SessionStorage, Map<string, Promise<Session>>>()
const REFRESH_WINDOW_MS = 60_000

async function singleFlight(
  storage: SessionStorage,
  id: string,
  acquire: () => Promise<Session>
): Promise<Session> {
  let pending = renewals.get(storage)
  if (!pending) {
    pending = new Map()
    renewals.set(storage, pending)
  }
  const existing = pending.get(id)
  if (existing) return existing
  const operation = acquire()
  pending.set(id, operation)
  try {
    return await operation
  } finally {
    pending.delete(id)
  }
}

export function exchangeOfflineSession(
  api: Shopify,
  storage: SessionStorage,
  shop: string,
  sessionToken: string
): Promise<Session> {
  return singleFlight(storage, api.session.getOfflineId(shop), async () => {
    const stored = await storage.loadSession(api.session.getOfflineId(shop))
    if (
      stored?.expires &&
      stored.refreshToken &&
      stored.refreshTokenExpires &&
      stored.refreshTokenExpires.getTime() > Date.now() &&
      stored.isActive(api.config.scopes, REFRESH_WINDOW_MS)
    )
      return stored
    const { session } = await api.auth.tokenExchange({
      shop,
      sessionToken,
      requestedTokenType: RequestedTokenType.OfflineAccessToken,
      expiring: true
    })
    return storeOfflineSession(storage, session)
  })
}

/** Persist the entire SDK Session, including both rotating credentials and expiry dates. */
export async function storeOfflineSession(
  storage: SessionStorage,
  session: Session
): Promise<Session> {
  if (
    !session.isOnline &&
    (!session.expires || !session.refreshToken || !session.refreshTokenExpires)
  ) {
    throw new HTTPError({
      status: 502,
      message: 'Shopify did not return an expiring offline token pair.'
    })
  }
  if (!(await storage.storeSession(session))) {
    throw new HTTPError({
      status: 503,
      message:
        'Could not persist Shopify credentials. Retry before making API requests.'
    })
  }
  return session
}

/** Single-flight per storage/session in this process. Multi-worker storage must coordinate rotation. */
export async function ensureOfflineSession(
  api: Shopify,
  storage: SessionStorage,
  supplied: Session
): Promise<Session> {
  if (supplied.isOnline || !supplied.accessToken) return supplied
  return singleFlight(storage, supplied.id, async () => {
    const session = (await storage.loadSession(supplied.id)) || supplied
    if (session.isOnline) return session
    if (
      session.expires &&
      (!session.refreshToken ||
        !session.refreshTokenExpires ||
        session.refreshTokenExpires.getTime() <= Date.now())
    ) {
      throw new HTTPError({
        status: 401,
        message:
          'Shopify refresh credentials expired or are missing. Reopen the app in Shopify admin or authorize the app again.'
      })
    }
    if (
      session.expires &&
      session.expires.getTime() > Date.now() + REFRESH_WINDOW_MS
    )
      return session
    try {
      const result = session.expires
        ? await api.auth.refreshToken({
            shop: session.shop,
            refreshToken: session.refreshToken!
          })
        : await api.auth.migrateToExpiringToken({
            shop: session.shop,
            nonExpiringOfflineAccessToken: session.accessToken!
          })
      return await storeOfflineSession(storage, result.session)
    } catch (error) {
      const status = (error as { response?: { code?: number } }).response?.code
      if (status === 400 || status === 401) {
        throw new HTTPError({
          status: 401,
          message:
            'Shopify could not renew offline access. Reopen the app in Shopify admin or authorize it again.'
        })
      }
      throw error
    }
  })
}
