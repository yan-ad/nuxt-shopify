import { defineHandler } from 'nitro'
import { getQuery, HTTPError } from 'nitro/h3'
import { useShopifyAdmin } from '../../../src/runtime/server/utils/authenticate-admin'
import { PRODUCTS_QUERY } from '../utils/operations'
import { requireAdminData } from '../utils/admin-data'

interface ProductsData {
  products: {
    nodes: Array<{
      id: string
      title: string
      status: string
      vendor: string
      featuredMedia: {
        preview: {
          image: { url: string; altText: string | null } | null
        } | null
      } | null
    }>
    pageInfo: { hasNextPage: boolean; endCursor: string | null }
  }
}

export default defineHandler(async (event) => {
  const { admin, session } = await useShopifyAdmin(event)
  const grantedScopes = new Set(session.scope?.split(',').map(scope => scope.trim()))
  if (!grantedScopes.has('read_products') && !grantedScopes.has('write_products')) {
    throw new HTTPError({
      status: 403,
      message: 'This app installation has not granted product access. Add read_products to the Shopify app access_scopes, approve the updated permissions in your development store, and reopen the app. Restarting Nuxt alone does not grant access.'
    })
  }
  const { first = '20', after, search = '', status = 'all' } = getQuery(event)
  if (
    typeof first !== 'string' ||
    ![10, 20, 50].includes(Number(first)) ||
    typeof search !== 'string' ||
    search.length > 200 ||
    typeof status !== 'string' ||
    !['all', 'active', 'draft', 'archived'].includes(status) ||
    (after !== undefined && (typeof after !== 'string' || after.length > 2048))
  ) {
    throw new HTTPError({
      status: 400,
      message: 'Invalid product filters or pagination.'
    })
  }
  // Quote user text so Shopify search operators cannot override the status filter.
  const title = search.trim() ? `title:${JSON.stringify(search.trim())}` : ''
  const query = [title, status === 'all' ? '' : `status:${status}`]
    .filter(Boolean)
    .join(' AND ')
  return requireAdminData(
    await admin.graphql<ProductsData>(PRODUCTS_QUERY, {
      variables: {
        first: Number(first),
        after: after || null,
        query: query || null
      }
    })
  ).products
})
