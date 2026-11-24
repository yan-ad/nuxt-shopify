import { definePlugin } from 'nitro'
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

    // Content-Security-Policy — scope frame-ancestors to the requesting shop
    if (shop) {
      response.headers.set(
        'Content-Security-Policy',
        `frame-ancestors https://${shop} https://admin.shopify.com https://*.spin.dev https://admin.myshopify.io https://admin.shop.dev;`
      )
    } else {
      response.headers.set(
        'Content-Security-Policy',
        `frame-ancestors https://*.myshopify.com https://admin.shopify.com https://*.spin.dev https://admin.myshopify.io https://admin.shop.dev;`
      )
    }
  })
})