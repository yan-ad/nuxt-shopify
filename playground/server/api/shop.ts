import { defineHandler } from 'nitro'
import { useShopifyAdmin } from '../../../src/runtime/server/utils/authenticate-admin'
import { SHOP_QUERY } from '../utils/operations'
import { requireAdminData } from '../utils/admin-data'

export default defineHandler(async (event) => {
  const { admin } = await useShopifyAdmin(event)
  return requireAdminData(
    await admin.graphql<{
      shop: {
        name: string
        currencyCode: string
        myshopifyDomain: string
        primaryDomain: { url: string }
      }
    }>(SHOP_QUERY)
  )
})
