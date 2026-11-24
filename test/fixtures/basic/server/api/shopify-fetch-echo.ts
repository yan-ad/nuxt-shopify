import { defineHandler } from 'nitro'
// Test endpoint: echoes back the Authorization header received,
// used to verify that useShopifyFetch forwards auth headers server-side.
export default defineHandler((event) => {
  return {
    authorization: event.req.headers.get('authorization') ?? null
  }
})
