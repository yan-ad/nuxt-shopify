import { defineHandler } from 'nitro'
import { useShopifyAdmin } from '../../../src/runtime/server/utils/authenticate-admin'
import { requireAdminData } from '../utils/admin-data'

export const ACCESS_QUERY = `#graphql
query PlaygroundAccess {
  shop { myshopifyDomain }
  currentAppInstallation { accessScopes { handle } }
}`

export default defineHandler(async (event) => {
  const { admin, session } = await useShopifyAdmin(event)
  const data = requireAdminData(
    await admin.graphql<{
      shop: { myshopifyDomain: string }
      currentAppInstallation: { accessScopes: Array<{ handle: string }> }
    }>(ACCESS_QUERY)
  )
  return {
    shop: data.shop.myshopifyDomain,
    grantedScopes: data.currentAppInstallation.accessScopes.map(
      (scope) => scope.handle
    ),
    sessionScopes: session.scope?.split(',').map((scope) => scope.trim()) || [],
    tokenType: session.isOnline ? 'online' : 'offline'
  }
})
