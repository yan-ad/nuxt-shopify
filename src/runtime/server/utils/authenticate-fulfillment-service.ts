import type { H3Event } from 'nitro/h3'
import { HTTPError } from 'nitro/h3'
import { getShopifyApi, getSessionStorage } from '../services/shopify'
import { createAdminApiContext } from './clients'

/**
 * Authenticate a request from a fulfillment service.
 *
 * ```ts
 * // server/api/fulfillment-service.ts
 * export default defineHandler(async (event) => {
 *   const { admin, session } = await useShopifyFulfillmentService(event)
 *   return { success: true }
 * })
 * ```
 */
export async function useShopifyFulfillmentService(event: H3Event) {
  const api = getShopifyApi()

  const shop = event.req.headers.get('x-shopify-shop-domain')
  const hmac = event.req.headers.get('x-shopify-hmac-sha256')

  if (!shop || !hmac) {
    throw new HTTPError({
      status: 400,
      statusText: 'Missing required headers'
    })
  }

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
    admin
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
