const SHOPIFY_ANCESTORS =
  'https://admin.shopify.com https://*.spin.dev https://admin.myshopify.io https://admin.shop.dev'

export function shopifyFramePolicy(
  requestUrl: string,
  development: boolean
): string {
  const url = new URL(requestUrl)
  const shop = url.searchParams.get('shop')
  // Never interpolate arbitrary query-string input into a security header.
  const shopOrigin =
    shop && /^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(shop)
      ? `https://${shop}`
      : 'https://*.myshopify.com'
  const inspector =
    development &&
    (url.pathname === '/_shopify/devtools' ||
      url.pathname.startsWith('/_shopify/devtools/'))
  return `frame-ancestors ${inspector ? "'self' " : ''}${shopOrigin} ${SHOPIFY_ANCESTORS};`
}
