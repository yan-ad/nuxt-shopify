import type { H3Event } from 'nitro/h3'
import { getQuery, HTTPError } from 'nitro/h3'
import type { JwtPayload } from '@shopify/shopify-api'
import { isbot } from 'isbot'
import { getShopifyApi, getResolvedConfig } from '../services/shopify'

export function getShopifyNodeContext(event: H3Event) {
  const node = event.runtime?.node
  if (!node) {
    throw new HTTPError({
      status: 500,
      message: 'Shopify OAuth requires a Node-compatible server runtime'
    })
  }
  return node
}

export function getSessionTokenHeader(event: H3Event): string | undefined {
  const authHeader = event.req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }
  return undefined
}

export function getSessionTokenFromUrlParam(
  event: H3Event
): string | undefined {
  const query = getQuery(event)
  return query.id_token as string | undefined
}

export function getShopFromEvent(event: H3Event): string | undefined {
  const query = getQuery(event)
  if (query.shop) return query.shop as string

  const shopHeader = event.req.headers.get('x-shopify-shop-domain')
  if (shopHeader) return shopHeader

  return undefined
}

export async function validateSessionToken(
  sessionToken: string
): Promise<JwtPayload> {
  const api = getShopifyApi()
  const payload = await api.session.decodeSessionToken(sessionToken)
  return payload
}

export function ensureCORSHeaders(event: H3Event): void {
  const config = getResolvedConfig()
  event.res.headers.set('Access-Control-Allow-Origin', config.appUrl)
  event.res.headers.set(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  )
  event.res.headers.set(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  )
  event.res.headers.set('Access-Control-Allow-Credentials', 'true')
}

export function isBotRequest(event: H3Event): boolean {
  const ua = event.req.headers.get('user-agent') || ''
  try {
    return isbot(ua)
  } catch {
    return false
  }
}

export async function verifyWebhookHmac(event: H3Event): Promise<boolean> {
  const api = getShopifyApi()
  const hmac = event.req.headers.get('x-shopify-hmac-sha256')
  const topic = event.req.headers.get('x-shopify-topic')
  const shop = event.req.headers.get('x-shopify-shop-domain')
  if (!hmac || !topic || !shop) {
    return false
  }
  const rawBody = await event.req.text()
  if (!rawBody) return false

  try {
    const { createHmac } = await import('node:crypto')
    const generatedHmac = createHmac('sha256', api.config.apiSecretKey)
      .update(rawBody, 'utf8')
      .digest('base64')
    return safeCompare(generatedHmac, hmac)
  } catch {
    return false
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

export function renderAppBridgePage(
  apiKey: string,
  _appUrl: string,
  redirectUrl?: string
): string {
  const parts: string[] = [
    '<!DOCTYPE html>',
    '<html>',
    '  <head>',
    '    <meta charset="utf-8" />',
    '    <meta name="shopify-api-key" content="' + apiKey + '" />',
    '    <script src="https://cdn.shopify.com/shopifycloud/app-bridge.js"></script>',
    '  </head>',
    '  <body>',
    '    <script>'
  ]
  if (redirectUrl) {
    parts.push("      window.open('" + redirectUrl + "', '_top');")
  }
  parts.push('    </script>')
  parts.push('  </body>')
  parts.push('</html>')
  return parts.join('\n')
}
