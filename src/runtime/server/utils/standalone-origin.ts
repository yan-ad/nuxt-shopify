import { HTTPError } from 'nitro/h3'

/** Use configured public origin, never untrusted forwarded-host headers. */
export function standaloneOrigin(requestUrl: string, appUrl: string): string {
  if (appUrl) {
    try {
      const url = new URL(appUrl)
      if (['https:', 'http:'].includes(url.protocol)) return url.origin
    } catch {
      /* Reject invalid configured URLs below. */
    }
    throw new HTTPError({
      status: 503,
      message:
        'Configure shopify.appUrl with the current public tunnel URL before opening standalone.'
    })
  }
  const url = new URL(requestUrl)
  if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
    return url.origin
  throw new HTTPError({
    status: 503,
    message: 'Configure shopify.appUrl before opening standalone.'
  })
}

export function assertStandaloneOrigin(
  request: Request,
  appUrl: string
): string {
  const origin = standaloneOrigin(request.url, appUrl)
  if (request.headers.get('origin') !== origin) {
    throw new HTTPError({
      status: 403,
      message:
        'Standalone origin does not match shopify.appUrl. Restart Nuxt with the current Shopify CLI tunnel URL, then create a new standalone link.'
    })
  }
  return origin
}
