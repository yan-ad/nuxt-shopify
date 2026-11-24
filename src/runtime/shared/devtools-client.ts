import { withDevtoolsTimeout } from './devtools-bridge'

export const DEVTOOLS_CLIENT_KEY = '__nuxtShopifyDevtoolsStore'

type InspectorWindow = Window & {
  __nuxtShopifyDevtoolsStore?: () => Promise<unknown>
}

export function findDevtoolsClient(
  start: Window,
  origin: string
): (() => Promise<unknown>) | undefined {
  let current = start as InspectorWindow
  let client: (() => Promise<unknown>) | undefined
  for (let depth = 0; depth < 12; depth++) {
    try {
      if (current.location.origin !== origin) break
      if (typeof current[DEVTOOLS_CLIENT_KEY] === 'function')
        client = current[DEVTOOLS_CLIENT_KEY]
      if (current === current.parent) break
      current = current.parent as InspectorWindow
    } catch {
      break
    }
  }
  return client
}

/** Run in the authenticated app window, not the inspector's nested iframe. */
export async function fetchDevtoolsStore(
  getToken: () => Promise<string>,
  request: typeof fetch
): Promise<unknown> {
  const controller = new AbortController()
  try {
    return await withDevtoolsTimeout(
      async () => {
        const token = await withDevtoolsTimeout(
          getToken,
          8000,
          'Shopify ID-token request timed out. Reload the app in Shopify admin and retry.'
        )
        const response = await request('/_shopify/devtools/store', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
          signal: controller.signal
        })
        const body = await response.json()
        if (!response.ok)
          throw new Error(
            body.message || `Store request failed (${response.status}).`
          )
        return body
      },
      20000,
      'Shopify store request timed out. Check the server logs and retry.'
    )
  } finally {
    controller.abort()
  }
}
