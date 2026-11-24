import { getShopifyNodeContext } from '../utils/helpers'
import { defineHandler } from 'nitro'
import { getQuery, redirect, HTTPError } from 'nitro/h3'
import { getShopifyApi, getResolvedConfig } from '../services/shopify'

/**
 * Handle the initial auth request.
 * For token exchange flow (embedded apps), this redirects to Shopify OAuth.
 */
export default defineHandler(async (event) => {
  const api = getShopifyApi()
  const config = getResolvedConfig()
  const query = getQuery(event)
  const shop = query.shop as string

  if (!shop) {
    throw new HTTPError({
      status: 400,
      statusText: 'Missing shop parameter'
    })
  }

  // Shopify API expects a path here and builds the absolute callback URL from
  // the configured host. Passing the full app URL would duplicate the host.
  const authUrl = await api.auth.begin({
    shop,
    callbackPath: config.auth.callbackPath,
    isOnline: false,
    rawRequest: getShopifyNodeContext(event).req,
    rawResponse: getShopifyNodeContext(event).res
  })

  return redirect(authUrl)
})
