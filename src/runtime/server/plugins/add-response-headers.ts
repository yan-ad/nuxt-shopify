import { definePlugin } from 'nitro'
import { shopifyFramePolicy } from '../utils/frame-policy'
import { APP_BRIDGE_URL, POLARIS_URL, CDN_URL } from '../../shared/polaris'

/**
 * Nitro plugin that adds Shopify-required response headers to every document request.
 *
 * Mirrors the behaviour of Shopify's official `addDocumentResponseHeaders`:
 * - `Content-Security-Policy`: frame-ancestors scoped to the requesting shop
 * - `Link`: preconnect / preload hints for App Bridge + Polaris CDN assets
 *
 * @see https://github.com/Shopify/shopify-app-js/blob/main/packages/apps/shopify-app-react-router/src/server/authenticate/helpers/add-response-headers.ts
 */
export default definePlugin((nitroApp) => {
  nitroApp.hooks.hook('response', (response, event) => {
    const shop = new URL(event.req.url).searchParams.get('shop')

    // Link header — preconnect to CDN + preload App Bridge & Polaris scripts
    if (shop) {
      response.headers.set(
        'Link',
        `<${CDN_URL}>; rel="preconnect", <${APP_BRIDGE_URL}>; rel="preload"; as="script", <${POLARIS_URL}>; rel="preload"; as="script"`
      )
    }

    response.headers.set(
      'Content-Security-Policy',
      shopifyFramePolicy(event.req.url, import.meta.dev)
    )
  })
})
