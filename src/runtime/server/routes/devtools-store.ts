import { defineHandler } from 'nitro'
import { HTTPError } from 'nitro/h3'
import { useShopifyAdmin } from '../utils/authenticate-admin'
import { getResolvedConfig } from '../services/shopify'
import { getDevtoolsInfo } from '../utils/devtools-info'

export const DEVTOOLS_STORE_QUERY = `#graphql
query NuxtShopifyDevtoolsStore {
  shop { name myshopifyDomain currencyCode primaryDomain { url } }
  currentAppInstallation { accessScopes { handle } }
}`

export default defineHandler(async (event) => {
  if (!import.meta.dev) throw new HTTPError({ status: 404 })
  event.res.headers.set('Cache-Control', 'no-store')
  const { admin, session } = await useShopifyAdmin(event)
  const result = await admin.graphql<{
    shop: {
      name: string
      myshopifyDomain: string
      currencyCode: string
      primaryDomain: { url: string }
    }
    currentAppInstallation: { accessScopes: Array<{ handle: string }> }
  }>(DEVTOOLS_STORE_QUERY)
  if (result.errors || !result.data)
    throw new HTTPError({
      status: 502,
      message:
        'Shopify could not return store information. Check installed app access.'
    })
  return {
    shop: result.data.shop,
    installedScopes: result.data.currentAppInstallation.accessScopes.map(
      (scope) => scope.handle
    ),
    ...getDevtoolsInfo(getResolvedConfig(), session)
  }
})
