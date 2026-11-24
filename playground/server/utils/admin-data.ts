import { HTTPError } from 'nitro/h3'

export function requireAdminData<T>(result: { data?: T; errors?: unknown }): T {
  if (result.errors || !result.data) {
    console.error(
      '[playground] Shopify Admin API request failed',
      result.errors
    )
    throw new HTTPError({
      status: 502,
      message:
        'Shopify could not complete this request. Check app permissions and try again.'
    })
  }
  return result.data
}
