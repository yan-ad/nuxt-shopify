export function shopifyAdminAppUrl(input: string, appHandle: string): string {
  const store = input
    .trim()
    .toLowerCase()
    .replace(/\.myshopify\.com\/?$/, '')
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(store)) {
    throw new Error(
      'Enter a valid store handle or myshopify.com domain, for example my-store.'
    )
  }
  const handle = appHandle.trim()
  if (!/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(handle)) {
    throw new Error(
      'Configure shopify.appHandle with the app handle from your Shopify app configuration.'
    )
  }
  return `https://admin.shopify.com/store/${encodeURIComponent(store)}/apps/${encodeURIComponent(handle)}`
}
