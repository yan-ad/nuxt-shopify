import { defineHandler } from 'nitro'
import {
  HTTPError,
  readBody,
  setCookie,
  getCookie,
  deleteCookie
} from 'nitro/h3'
import {
  consumeStandaloneTicket,
  revokeStandalone,
  STANDALONE_COOKIE
} from '../utils/devtools-standalone'
import { assertStandaloneOrigin } from '../utils/standalone-origin'
import { getResolvedConfig } from '../services/shopify'

export default defineHandler(async (event) => {
  if (!import.meta.dev) throw new HTTPError({ status: 404 })
  event.res.headers.set('Cache-Control', 'no-store')
  if (!['POST', 'DELETE'].includes(event.req.method))
    throw new HTTPError({ status: 405 })
  // Do not allow cross-origin sites to redeem or revoke inspector connections.
  const publicOrigin = assertStandaloneOrigin(
    event.req,
    getResolvedConfig().appUrl
  )
  if (event.req.method === 'DELETE') {
    const cookie = getCookie(event, STANDALONE_COOKIE)
    if (cookie) revokeStandalone(cookie)
    deleteCookie(event, STANDALONE_COOKIE, { path: '/' })
    return { connected: false }
  }
  const body = await readBody<{ ticket?: unknown }>(event)
  if (typeof body?.ticket !== 'string' || body.ticket.length > 100)
    throw new HTTPError({ status: 400 })
  const connection = consumeStandaloneTicket(body.ticket)
  if (!connection)
    throw new HTTPError({
      status: 401,
      message:
        'Standalone link expired or was already used. Open a new link from the embedded inspector.'
    })
  setCookie(event, STANDALONE_COOKIE, connection, {
    httpOnly: true,
    sameSite: 'strict',
    secure: new URL(publicOrigin).protocol === 'https:',
    path: '/',
    maxAge: 1800
  })
  return { connected: true }
})
