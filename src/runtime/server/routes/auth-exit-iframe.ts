import { defineHandler } from 'nitro'
import { getQuery } from 'nitro/h3'
import { getResolvedConfig } from '../services/shopify'
import { renderAppBridgePage } from '../utils/helpers'

/**
 * Render the exit-iframe page.
 * This page uses App Bridge to redirect the user out of the auth iframe.
 */
export default defineHandler(async (event) => {
  const config = getResolvedConfig()
  const query = getQuery(event)
  const destination = (query.exitIframe as string) || config.appUrl

  const html = renderAppBridgePage(config.apiKey, config.appUrl, destination)
  event.res.headers.set('content-type', 'text/html')
  return html
})