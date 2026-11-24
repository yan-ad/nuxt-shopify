/** Public standalone metadata only. Shopify credentials remain server-side. */
export interface ShopifyStandaloneContext {
  shop: string
}

declare module '#app' {
  interface NuxtPayload {
    shopifyStandalone?: ShopifyStandaloneContext
  }
}
