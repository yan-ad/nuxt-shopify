import type { H3Event } from 'nitro/h3'
import { HTTPError } from 'nitro/h3'
import {
  getShopifyApi,
  getResolvedConfig,
  getSessionStorage
} from '../services/shopify'
import type { WebhookContext } from '../../types'

/**
 * Authenticate a Shopify webhook request.
 *
 * Validates the HMAC signature and returns the webhook context:
 *
 * ```ts
 * // server/api/webhooks.ts
 * export default defineHandler(async (event) => {
 *   const { topic, shop, session, payload } = await useShopifyWebhook(event)
 *
 *   switch (topic) {
 *     case 'PRODUCTS_CREATE':
 *       // handle product creation
 *       break
 *     case 'APP_UNINSTALLED':
 *       // clean up shop data
 *       break
 *   }
 *
 *   return { success: true }
 * })
 * ```
 */
export async function useShopifyWebhook(
  event: H3Event
): Promise<WebhookContext> {
  const api = getShopifyApi()
  const config = getResolvedConfig()

  // Only POST requests
  if (event.req.method !== 'POST') {
    throw new HTTPError({
      status: 405,
      statusText: 'Method Not Allowed - Webhooks must be POST'
    })
  }

  const topic = event.req.headers.get('x-shopify-topic')
  const shop = event.req.headers.get('x-shopify-shop-domain')
  const hmac = event.req.headers.get('x-shopify-hmac-sha256')
  const apiVersion =
    event.req.headers.get('x-shopify-api-version') || config.apiVersion

  if (!topic || !shop || !hmac) {
    throw new HTTPError({
      status: 400,
      statusText:
        'Missing required webhook headers (x-shopify-topic, x-shopify-shop-domain, x-shopify-hmac-sha256)'
    })
  }

  // Read the raw body for HMAC verification
  const rawBody = await event.req.text()
  if (!rawBody) {
    throw new HTTPError({
      status: 400,
      statusText: 'Missing request body'
    })
  }

  // Verify HMAC
  const { createHmac } = await import('node:crypto')
  const generatedHmac = createHmac('sha256', api.config.apiSecretKey)
    .update(rawBody, 'utf8')
    .digest('base64')

  // Timing-safe comparison
  if (!safeCompare(generatedHmac, hmac)) {
    throw new HTTPError({
      status: 401,
      statusText: 'Webhook HMAC validation failed'
    })
  }

  // Parse payload
  let payload: Record<string, any>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    throw new HTTPError({
      status: 400,
      statusText: 'Invalid JSON in webhook body'
    })
  }

  // Try to load the session for this shop
  let session
  try {
    const sessionStorage = getSessionStorage()
    const offlineId = api.session.getOfflineId(shop)
    session = (await sessionStorage.loadSession(offlineId)) || undefined
  } catch {
    // Session may not exist (e.g., APP_UNINSTALLED webhook)
    session = undefined
  }

  return {
    topic: topic.toUpperCase().replace(/\//g, '_'),
    shop,
    session,
    payload,
    apiVersion
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks.
 */
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
