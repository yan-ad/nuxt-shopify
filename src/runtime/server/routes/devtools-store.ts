import { defineHandler } from 'nitro'
import { HTTPError, getCookie } from 'nitro/h3'
import { useShopifyAdmin } from '../utils/authenticate-admin'
import {
  getResolvedConfig,
  getSessionStorage,
  getShopifyApi
} from '../services/shopify'
import {
  standaloneSessionId,
  STANDALONE_COOKIE
} from '../utils/devtools-standalone'
import { ensureOfflineSession } from '../utils/offline-session'
import { createAdminApiContext } from '../utils/clients'
import { getDevtoolsInfo } from '../utils/devtools-info'

export const DEVTOOLS_STORE_QUERY = `#graphql
query NuxtShopifyDevtoolsStore {
  shop { name myshopifyDomain currencyCode primaryDomain { url } }
  currentAppInstallation { accessScopes { handle } }
}`

export default defineHandler(async (event) => {
  if (!import.meta.dev) throw new HTTPError({ status: 404 })
  event.res.headers.set('Cache-Control', 'no-store')
  let context
  const connection = getCookie(event, STANDALONE_COOKIE)
  if (!event.req.headers.has('authorization') && connection) {
    const id = standaloneSessionId(connection)
    const storage = getSessionStorage()
    const stored = id ? await storage.loadSession(id) : undefined
    if (!stored)
      throw new HTTPError({
        status: 401,
        message: 'Standalone connection expired. Reconnect from Shopify admin.'
      })
    const api = getShopifyApi()
    const session = await ensureOfflineSession(api, storage, stored)
    if (!session.isActive(api.config.scopes))
      throw new HTTPError({
        status: 401,
        message: 'Shopify session expired. Reconnect from Shopify admin.'
      })
    context = { session, admin: createAdminApiContext(api, session) }
  } else context = await useShopifyAdmin(event)
  const { admin, session } = context
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
