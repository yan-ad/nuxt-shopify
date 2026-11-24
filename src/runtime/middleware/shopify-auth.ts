import {
  defineNuxtRouteMiddleware,
  navigateTo,
  useCookie,
  useRuntimeConfig,
  useNuxtApp
} from '#app'

export default defineNuxtRouteMiddleware((to) => {
  if (import.meta.dev && useNuxtApp().payload.shopifyStandalone) return
  const config = useRuntimeConfig().public.shopify

  const authPage = config.authPagePath || '/auth'
  const redirectTo = useCookie(config.redirectCookie)

  // On the server, check if the request has the required Shopify query params.
  // Shopify always adds `shop` and `host` when loading an embedded app.
  if (import.meta.server) {
    const shop = to.query.shop as string | undefined
    if (!shop) {
      redirectTo.value = to.fullPath
      return navigateTo(authPage)
    }
    return
  }

  // On the client, check if App Bridge is available and has a shop configured.
  const shop = window.shopify?.config?.shop

  if (!shop) {
    redirectTo.value = to.fullPath
    return navigateTo(authPage)
  }
})
