# Shopify playground

Run `bun run dev` from the repository root and open the Shopify CLI app preview inside your development store's admin. The pages require App Bridge authentication; opening localhost directly is not a substitute for an authorized Shopify session.

## Store configuration

- Supply your app's API key, secret, and CLI-managed app URL through environment variables.
- Include `read_products` in the Shopify app configuration's `[access_scopes]` and approve the requested permissions in your development store. Setting `shopify.scopes` in Nuxt does not change the store's installed permissions by itself.
- The API operations target the module's default Admin API version, `2026-01`.
- Never commit credentials or access tokens.

## Pages

- `/`: authenticated store name, currency, myshopify domain, and storefront link.
- `/products`: real Admin GraphQL product titles, statuses, vendors, and media previews. Supports title search, status filters, and cursor-based next/previous pagination. Product links open the corresponding Shopify admin resource.
- `/settings`: products-per-page and initial status preferences stored as a JSON app-data metafield on the authenticated `currentAppInstallation` (`nuxt_shopify_playground.preferences`). The save operation derives its owner on the server and uses `compareDigest` to reject stale writes. If another tab saves first, reload the saved settings before retrying.

Initial preferences (20 products and all statuses) apply only when no settings have been saved. They are not sample product or shop data. API errors and empty catalogs are surfaced explicitly; no mocked data is substituted.

The default session storage is in memory and is cleared when the server restarts. Preferences remain in Shopify; reopen the app through Shopify admin to authenticate again. Use durable session storage for production.

## Verify with your store

1. Open the app preview and confirm the store overview matches your store.
2. Open Products, search an existing title, filter statuses, and paginate a catalog with more than one page.
3. Change Settings, save, reload, and reopen Products to verify those preferences are applied.
4. Open Settings in two tabs and save in both: the stale second save should fail instead of overwriting the first.
5. Revoke product access or disconnect the network and verify a visible error/retry state rather than fabricated rows.
