import { defineEventHandler, getQuery, sendRedirect, createError } from 'h3'
import { getShopifyApi, getResolvedConfig } from '../services/shopify'

/**
 * Handle the initial auth request.
 * For token exchange flow (embedded apps), this redirects to Shopify OAuth.
 */
export default defineEventHandler(async (event) => {
  const api = getShopifyApi()
  const config = getResolvedConfig()
  const query = getQuery(event)
  const shop = query.shop as string

  if (!shop) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing shop parameter'
    })
  }

  // Shopify API expects a path here and builds the absolute callback URL from
  // the configured host. Passing the full app URL would duplicate the host.
  const authUrl = await api.auth.begin({
    shop,
    callbackPath: config.auth.callbackPath,
    isOnline: false,
    rawRequest: event.req,
    rawResponse: event.res
  })

  return sendRedirect(event, authUrl)
})