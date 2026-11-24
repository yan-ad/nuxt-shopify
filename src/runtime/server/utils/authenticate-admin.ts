import type { H3Event } from 'nitro/h3'
import { getQuery, HTTPError } from 'nitro/h3'
import {
  getShopifyApi,
  getResolvedConfig,
  getSessionStorage
} from '../services/shopify'
import { createAdminApiContext } from './clients'
import {
  ensureOfflineSession,
  storeOfflineSession,
  exchangeOfflineSession
} from './offline-session'
import {
  getShopifyNodeContext,
  getSessionTokenHeader,
  getSessionTokenFromUrlParam,
  validateSessionToken,
  ensureCORSHeaders,
  isBotRequest,
  getShopFromEvent,
  renderAppBridgePage
} from './helpers'
import type { AdminContext, BillingContext, ResolvedConfig } from '../../types'
import type { JwtPayload, Session, Shopify } from '@shopify/shopify-api'
import { RequestedTokenType } from '@shopify/shopify-api'
import type { SessionStorage } from '@shopify/shopify-app-session-storage'
import { AppDistribution } from '../../types'

/**
 * Authenticate an admin request and return an authenticated admin context.
 *
 * Use this in your server API routes to interact with the Shopify Admin API:
 *
 * ```ts
 * // server/api/products.ts
 * export default defineHandler(async (event) => {
 *   const { admin, session } = await useShopifyAdmin(event)
 *   const response = await admin.graphql(`{ shop { name } }`)
 *   return response
 * })
 * ```
 */
export async function useShopifyAdmin<T extends object = JwtPayload>(
  event: H3Event
): Promise<AdminContext<T>> {
  const api = getShopifyApi()
  const config = getResolvedConfig()
  const sessionStorage = getSessionStorage()

  // Handle bot requests
  if (isBotRequest(event)) {
    throw new HTTPError({
      status: 410,
      statusText: 'Gone'
    })
  }

  // Handle OPTIONS requests (CORS preflight)
  if (event.req.method === 'OPTIONS') {
    ensureCORSHeaders(event)
    throw new HTTPError({
      status: 204,
      statusText: 'No Content'
    })
  }

  // Get session token from header or URL param
  const headerToken = getSessionTokenHeader(event)
  const paramToken = getSessionTokenFromUrlParam(event)
  const sessionToken = headerToken || paramToken

  if (!sessionToken) {
    // No session token — for document requests, redirect to auth
    const shop = getShopFromEvent(event)
    if (!shop) {
      throw new HTTPError({
        status: 400,
        statusText: 'Missing shop parameter'
      })
    }

    // Redirect to OAuth
    const query = getQuery(event)
    const host = query.host as string
    if (!host) {
      // Return App Bridge page for embedded apps
      throw new HTTPError({
        status: 302,
        statusText: 'Redirect',
        data: {
          redirect: `${config.auth.path}?shop=${shop}`
        }
      })
    }

    throw new HTTPError({
      status: 401,
      statusText: 'Unauthorized - No session token'
    })
  }

  // Validate the session token
  let payload: JwtPayload | undefined
  let shop: string
  let sessionId: string

  if (config.distribution !== AppDistribution.ShopifyAdmin) {
    try {
      payload = await validateSessionToken(sessionToken)
    } catch {
      throw new HTTPError({
        status: 401,
        statusText: 'Unauthorized - Invalid session token'
      })
    }
    const dest = new URL(payload.dest)
    shop = dest.hostname

    sessionId = config.useOnlineTokens
      ? api.session.getJwtSessionId(shop, payload.sub)
      : api.session.getOfflineId(shop)
  } else {
    // ShopifyAdmin apps - get shop from request
    shop = getShopFromEvent(event) || ''
    sessionId =
      (await api.session.getCurrentId({
        isOnline: config.useOnlineTokens,
        rawRequest: getShopifyNodeContext(event).req,
        rawResponse: getShopifyNodeContext(event).res
      })) || ''
  }

  // Load existing session from storage
  let existingSession = sessionId
    ? await sessionStorage.loadSession(sessionId)
    : undefined

  if (existingSession && !existingSession.isOnline) {
    try {
      existingSession = await ensureOfflineSession(
        api,
        sessionStorage,
        existingSession
      )
    } catch (error) {
      // Embedded requests have a verified ID token and can reacquire access.
      // Never discard credentials on transient transport/storage errors.
      if (
        config.distribution !== AppDistribution.ShopifyAdmin &&
        (error as HTTPError).status === 401
      )
        existingSession = undefined
      else throw error
    }
  }

  let session: Session

  if (existingSession && existingSession.isActive(api.config.scopes)) {
    // Session exists and is active
    session = existingSession
  } else {
    // Need to perform token exchange
    if (config.distribution === AppDistribution.ShopifyAdmin) {
      if (!existingSession) {
        throw new HTTPError({
          status: 401,
          statusText: 'No session found for this shop'
        })
      }
      session = existingSession
    } else {
      // Token exchange for embedded apps
      session = await performTokenExchange(
        api,
        config,
        sessionStorage,
        shop,
        sessionToken
      )
    }
  }

  // Create the admin API context
  const admin = createAdminApiContext(api, session)

  // Create billing context
  const billing = createBillingContext(api, config, session, event)

  // Create CORS helper
  const cors = (response: Response): Response => {
    response.headers.set('Access-Control-Allow-Origin', config.appUrl)
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    return response
  }

  // Create redirect helper
  const redirect = (url: string, init?: { target?: string }): Response => {
    const target = init?.target || '_self'
    if (url.startsWith('shopify://') || target !== '_self') {
      return new Response(
        renderAppBridgePage(config.apiKey, config.appUrl, url),
        {
          status: 200,
          headers: { 'Content-Type': 'text/html' }
        }
      )
    }
    return new Response(null, {
      status: 302,
      headers: { Location: url }
    })
  }

  return {
    session,
    admin,
    sessionToken: payload as T | undefined,
    billing,
    cors,
    redirect
  }
}

async function performTokenExchange(
  api: Shopify,
  config: ResolvedConfig,
  sessionStorage: SessionStorage,
  shop: string,
  sessionToken: string
) {
  let onlineSession: Session
  try {
    const result = config.useOnlineTokens
      ? await api.auth.tokenExchange({
          shop,
          sessionToken,
          requestedTokenType: RequestedTokenType.OnlineAccessToken
        })
      : {
          session: await exchangeOfflineSession(
            api,
            sessionStorage,
            shop,
            sessionToken
          )
        }
    onlineSession = result.session
  } catch (error: unknown) {
    console.debug('[@yan-ad/nuxt-shopify] Token exchange failed:', {
      shop,
      requestedTokenType: config.useOnlineTokens
        ? RequestedTokenType.OnlineAccessToken
        : RequestedTokenType.OfflineAccessToken,
      scopes: api.config.scopes?.toString()
      // Never log token endpoint bodies, which may contain credentials.
    })
    throw error
  }

  // Store the session
  if (onlineSession.isOnline)
    await storeOfflineSession(sessionStorage, onlineSession)

  // If using online tokens, also get and store an offline token
  if (config.useOnlineTokens) {
    await exchangeOfflineSession(api, sessionStorage, shop, sessionToken)
  }

  // Run afterAuth hook
  if (config.hooks?.afterAuth) {
    const admin = createAdminApiContext(api, onlineSession)
    await config.hooks.afterAuth({ session: onlineSession, admin })
  }

  return onlineSession
}

function createBillingContext(
  api: Shopify,
  config: ResolvedConfig,
  session: Session,
  _event: H3Event
): BillingContext {
  return {
    require: async (options: { plans: string | string[] }) => {
      if (!config.billing) {
        throw new Error(
          'Billing is not configured. Add billing config to configureShopify().'
        )
      }
      const plans = Array.isArray(options.plans)
        ? options.plans
        : [options.plans]
      const hasPayment = await api.billing.check({ session, plans })
      if (!hasPayment) {
        const confirmationUrl = await api.billing.request({
          session,
          plan: plans[0]!,
          isTest: true
        })
        throw new Response(null, {
          status: 302,
          headers: { Location: confirmationUrl }
        })
      }
    },
    check: async (options?: { plans?: string | string[] }) => {
      if (!config.billing) return { hasActivePayment: false }
      const plans = options?.plans
        ? Array.isArray(options.plans)
          ? options.plans
          : [options.plans]
        : Object.keys(config.billing)
      return api.billing.check({ session, plans })
    },
    request: async (options: {
      plan: string
      isTest?: boolean
      returnUrl?: string
    }) => {
      if (!config.billing) {
        throw new Error('Billing is not configured.')
      }
      const confirmationUrl = await api.billing.request({
        session,
        plan: options.plan,
        isTest: options.isTest ?? true,
        returnUrl: options.returnUrl
      })
      return new Response(null, {
        status: 302,
        headers: { Location: confirmationUrl }
      })
    }
  }
}
