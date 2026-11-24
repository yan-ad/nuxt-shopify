import { defineHandler } from 'nitro'

export default defineHandler(async (event) => {
  const { topic, shop, _payload } = await useShopifyWebhook(event)
  return { success: true, topic, shop }
})
