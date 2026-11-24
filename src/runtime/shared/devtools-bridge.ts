import type { ShopifyGlobal } from '@shopify/app-bridge-types'

type BridgeWindow = Pick<Window, 'location' | 'parent'> & {
  shopify?: ShopifyGlobal
}

/** Skip bridges injected into nested inspector/DevTools documents. */
export function findDevtoolsBridge(
  start: Window,
  origin: string
): ShopifyGlobal | undefined {
  let current = start as BridgeWindow
  let bridge: ShopifyGlobal | undefined
  for (let depth = 0; depth < 12; depth++) {
    try {
      if (current.location.origin !== origin) break
      if (current.shopify?.config?.shop) bridge = current.shopify
      if (current === current.parent) break
      current = current.parent as BridgeWindow
    } catch {
      // Shopify admin is cross-origin; retain the app bridge just below it.
      break
    }
  }
  return bridge
}

export async function withDevtoolsTimeout<T>(
  operation: () => Promise<T>,
  timeoutMs: number,
  message: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      operation(),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(message)), timeoutMs)
      })
    ])
  } finally {
    clearTimeout(timer)
  }
}
