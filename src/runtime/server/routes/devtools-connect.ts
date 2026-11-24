import { defineHandler } from 'nitro'
import { HTTPError } from 'nitro/h3'
import { useShopifyAdmin } from '../utils/authenticate-admin'
import { createStandaloneTicket } from '../utils/devtools-standalone'

export default defineHandler(async (event) => {
  if (!import.meta.dev) throw new HTTPError({ status: 404 })
  event.res.headers.set('Cache-Control', 'no-store')
  // Creation always requires a real Shopify ID token; a standalone cookie is insufficient.
  if (!event.req.headers.get('authorization')?.startsWith('Bearer '))
    throw new HTTPError({ status: 401 })
  const { session } = await useShopifyAdmin(event)
  return { ticket: createStandaloneTicket(session.id) }
})
