import { defineHandler } from 'nitro'
import { getCookie } from 'nitro/h3'
import {
  standaloneSessionId,
  STANDALONE_COOKIE
} from '../utils/devtools-standalone'
import {
  getSessionStorage,
  getShopifyApi,
  getResolvedConfig
} from '../services/shopify'
import { assertStandaloneOrigin } from '../utils/standalone-origin'
import { ensureOfflineSession } from '../utils/offline-session'

export default defineHandler(async (event) => {
  if (!import.meta.dev) return
  const cookie = getCookie(event, STANDALONE_COOKIE)
  const id = cookie ? standaloneSessionId(cookie) : undefined
  if (!id) return
  if (!['GET', 'HEAD', 'OPTIONS'].includes(event.req.method))
    assertStandaloneOrigin(event.req, getResolvedConfig().appUrl)
  const storage = getSessionStorage()
  const stored = await storage.loadSession(id)
  if (!stored) return
  const api = getShopifyApi()
  const session = await ensureOfflineSession(api, storage, stored)
  if (!session.isActive(api.config.scopes)) return
  event.context.shopifyStandalone = session
  event.res.headers.set('Cache-Control', 'no-store')
})
