import { defineNuxtPlugin } from '#app'
import {
  DEVTOOLS_CLIENT_KEY,
  fetchDevtoolsStore
} from '../shared/devtools-client'

export default defineNuxtPlugin(() => {
  if (window.location.pathname === '/_shopify/devtools') return
  const host = window as Window & {
    __nuxtShopifyDevtoolsStore?: () => Promise<unknown>
  }
  const previous = host[DEVTOOLS_CLIENT_KEY]
  // Capture the app window's fetch and App Bridge context. Nested DevTools
  // documents must not issue their own Shopify-intercepted requests.
  const request = window.fetch.bind(window)
  const client = () =>
    fetchDevtoolsStore(async () => {
      if (!window.shopify?.config?.shop)
        throw new Error(
          'Open this app inside Shopify admin before connecting the store inspector.'
        )
      return window.shopify.idToken()
    }, request)
  host[DEVTOOLS_CLIENT_KEY] = client
  import.meta.hot?.dispose(() => {
    if (host[DEVTOOLS_CLIENT_KEY] === client)
      host[DEVTOOLS_CLIENT_KEY] = previous
  })
})
