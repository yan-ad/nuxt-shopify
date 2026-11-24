import type { H3Event } from 'nitro/h3'
import { HTTPError } from 'nitro/h3'
import { getShopifyApi, getSessionStorage } from '../services/shopify'
import { createAdminApiContext } from './clients'
import type { FlowContext } from '../../types'

/**
 * Authenticate a Shopify Flow extension request.
 *
 * Validates the HMAC signature and returns the flow context:
 *
 * ```ts
 * // server/api/flow.ts
 * export default defineHandler(async (event) => {
 *   const { admin, session, payload } = await useShopifyFlow(event)
 *   // Perform flow extension logic
 *   return { success: true }
 * })
 * ```
 */
export async function useShopifyFlow<
  Payload extends Record<string, any> = Record<string, any>
>(event: H3Event): Promise<FlowContext<Payload>> {
  const api = getShopifyApi()

  if (event.req.method !== 'POST') {
    throw new HTTPError({
      status: 405,
      statusText: 'Method Not Allowed - Flow requests must be POST'
    })
  }

  const shop = event.req.headers.get('x-shopify-shop-domain')
  const hmac = event.req.headers.get('x-shopify-hmac-sha256')

  if (!shop || !hmac) {
    throw new HTTPError({
      status: 400,
      statusText: 'Missing required headers'
    })
  }

  // Read raw body for HMAC verification
  const rawBody = await event.req.text()
  if (!rawBody) {
    throw new HTTPError({
      status: 400,
      statusText: 'Missing request body'
    })
  }

  // Verify HMAC
  const { createHmac: hmacCreate } = await import('node:crypto')
  const generatedHmac = hmacCreate('sha256', api.config.apiSecretKey)
    .update(rawBody, 'utf8')
    .digest('base64')

  if (!safeCompare(generatedHmac, hmac)) {
    throw new HTTPError({
      status: 401,
      statusText: 'HMAC validation failed'
    })
  }

  // Parse payload
  let payload: Payload
  try {
    payload = JSON.parse(rawBody) as Payload
  } catch {
    throw new HTTPError({
      status: 400,
      statusText: 'Invalid JSON body'
    })
  }

  // Load session
  const sessionStorage = getSessionStorage()
  const offlineId = api.session.getOfflineId(shop)
  const session = await sessionStorage.loadSession(offlineId)

  if (!session) {
    throw new HTTPError({
      status: 400,
      statusText: `No session found for shop ${shop}`
    })
  }

  const admin = createAdminApiContext(api, session)

  return {
    session,
    admin,
    payload
  }
}

function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  const encoder = new TextEncoder()
  const bufA = encoder.encode(a)
  const bufB = encoder.encode(b)
  let result = 0
  for (let i = 0; i < bufA.length; i++) {
    result |= bufA[i]! ^ bufB[i]!
  }
  return result === 0
}
