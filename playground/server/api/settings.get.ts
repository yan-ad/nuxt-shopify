import { defineHandler } from 'nitro'
import { HTTPError } from 'nitro/h3'
import { useShopifyAdmin } from '../../../src/runtime/server/utils/authenticate-admin'
import { defaultSettings, parseSettings } from '../../shared/settings'
import { SETTINGS_QUERY } from '../utils/operations'
import { requireAdminData } from '../utils/admin-data'

export interface SettingsData {
  currentAppInstallation: {
    id: string
    metafield: { value: string; compareDigest: string } | null
  }
}

export default defineHandler(async (event) => {
  const { admin } = await useShopifyAdmin(event)
  const { currentAppInstallation } = requireAdminData(
    await admin.graphql<SettingsData>(SETTINGS_QUERY)
  )
  if (!currentAppInstallation)
    throw new HTTPError({
      status: 502,
      message: 'App installation was not returned by Shopify.'
    })
  const field = currentAppInstallation.metafield
  try {
    return {
      settings: field
        ? parseSettings(JSON.parse(field.value))
        : { ...defaultSettings },
      persisted: Boolean(field),
      compareDigest: field?.compareDigest ?? null
    }
  } catch {
    throw new HTTPError({
      status: 502,
      message:
        'Saved preferences are invalid. Inspect the app installation metafield in Shopify.'
    })
  }
})
