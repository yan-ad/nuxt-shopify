import { defineHandler } from 'nitro'
import { readBody, HTTPError } from 'nitro/h3'
import { useShopifyAdmin } from '../../../src/runtime/server/utils/authenticate-admin'
import { parseSettings } from '../../shared/settings'
import type { SettingsData } from './settings.get'
import { SETTINGS_QUERY, SAVE_SETTINGS_MUTATION } from '../utils/operations'
import { requireAdminData } from '../utils/admin-data'

export default defineHandler(async (event) => {
  const { admin } = await useShopifyAdmin(event)
  const body = await readBody<Record<string, unknown>>(event)
  let settings
  try {
    settings = parseSettings(body?.settings)
  } catch (error) {
    throw new HTTPError({ status: 400, message: (error as Error).message })
  }
  if (body?.compareDigest !== null && typeof body?.compareDigest !== 'string')
    throw new HTTPError({
      status: 400,
      message: 'Missing settings revision. Reload the page.'
    })
  // Derive ownership from the authenticated installation, never a client ownerId.
  const { currentAppInstallation } = requireAdminData(
    await admin.graphql<SettingsData>(SETTINGS_QUERY)
  )
  if (!currentAppInstallation)
    throw new HTTPError({
      status: 502,
      message: 'App installation unavailable.'
    })
  const result = requireAdminData(
    await admin.graphql<{
      metafieldsSet: {
        metafields: Array<{ value: string; compareDigest: string }>
        userErrors: Array<{ message: string; code: string }>
      }
    }>(SAVE_SETTINGS_MUTATION, {
      variables: {
        metafields: [
          {
            ownerId: currentAppInstallation.id,
            namespace: 'nuxt_shopify_playground',
            key: 'preferences',
            type: 'json',
            value: JSON.stringify(settings),
            compareDigest: body.compareDigest
          }
        ]
      }
    })
  )
  const errors = result.metafieldsSet.userErrors
  if (errors.length)
    throw new HTTPError({
      status: errors.some((error) => error.code === 'INVALID_COMPARE_DIGEST')
        ? 409
        : 422,
      message: errors.map((error) => error.message).join('; ')
    })
  const saved = result.metafieldsSet.metafields[0]
  if (!saved)
    throw new HTTPError({
      status: 502,
      message: 'Shopify did not confirm the settings save.'
    })
  return { settings, persisted: true, compareDigest: saved.compareDigest }
})
