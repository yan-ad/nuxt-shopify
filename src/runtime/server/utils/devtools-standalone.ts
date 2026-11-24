import { randomBytes, createHash } from 'node:crypto'

const tickets = new Map<string, { sessionId: string; expires: number }>()
const connections = new Map<string, { sessionId: string; expires: number }>()
const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex')
function prune() {
  for (const map of [tickets, connections])
    for (const [key, value] of map)
      if (value.expires <= Date.now()) map.delete(key)
}
export function createStandaloneTicket(sessionId: string): string {
  prune()
  const token = randomBytes(32).toString('base64url')
  tickets.set(digest(token), { sessionId, expires: Date.now() + 30_000 })
  return token
}
export function consumeStandaloneTicket(token: string): string | undefined {
  prune()
  const key = digest(token)
  const value = tickets.get(key)
  tickets.delete(key)
  if (!value) return
  const connection = randomBytes(32).toString('base64url')
  connections.set(digest(connection), {
    sessionId: value.sessionId,
    expires: Date.now() + 30 * 60_000
  })
  return connection
}
export function standaloneSessionId(connection: string): string | undefined {
  prune()
  return connections.get(digest(connection))?.sessionId
}
export function revokeStandalone(connection: string) {
  connections.delete(digest(connection))
}
export const STANDALONE_COOKIE = 'nuxt-shopify-inspector'
