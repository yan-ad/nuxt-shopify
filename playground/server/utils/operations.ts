export const PRODUCTS_QUERY = `#graphql
query PlaygroundProducts($first: Int!, $after: String, $query: String) {
  products(first: $first, after: $after, query: $query, sortKey: TITLE) {
    nodes { id title status vendor }
    pageInfo { hasNextPage endCursor }
  }
}`

export const SETTINGS_QUERY = `#graphql
query PlaygroundSettings {
  currentAppInstallation {
    id
    metafield(namespace: "nuxt_shopify_playground", key: "preferences") { value compareDigest }
  }
}`

export const SAVE_SETTINGS_MUTATION = `#graphql
mutation PlaygroundSaveSettings($metafields: [MetafieldsSetInput!]!) {
  metafieldsSet(metafields: $metafields) {
    metafields { value compareDigest }
    userErrors { field message code }
  }
}`

export const SHOP_QUERY = `#graphql
query PlaygroundShop {
  shop { name currencyCode myshopifyDomain primaryDomain { url } }
}`
