<script setup lang="ts">
definePageMeta({ middleware: 'shopify-auth', layout: 'auth' })
const { data, error, status, refresh } = await useAsyncData(
  'playground-shop',
  () => useShopifyFetch('/api/shop'),
  { server: false }
)
const shop = computed(() => data.value?.data.shop)
</script>

<template>
  <ShPage heading="Store overview">
    <ShButton
      slot="secondary-actions"
      :loading="status === 'pending'"
      @click="refresh()"
      >Refresh store</ShButton
    >
    <ShStack gap="base">
      <p v-if="status === 'pending'" role="status">
        Loading your Shopify store…
      </p>
      <ShBanner v-if="error" heading="Could not load your store" tone="critical"
        ><ShParagraph>{{ error.message }}</ShParagraph
        ><ShButton @click="refresh()">Try again</ShButton></ShBanner
      >
      <ShSection v-if="shop" :heading="shop.name">
        <ShParagraph
          >{{ shop.myshopifyDomain }} · {{ shop.currencyCode }}</ShParagraph
        >
        <ShLink :href="shop.primaryDomain.url" target="_blank"
          >Visit storefront</ShLink
        >
      </ShSection>
      <ShSection heading="Explore your app">
        <ShStack gap="base"
          ><ShParagraph
            >Browse live products from the Admin API and save per-store app
            preferences in Shopify. No sample products or simulated
            saves.</ShParagraph
          ><ShButtonGroup
            ><ShButton href="/products" variant="primary"
              >View products</ShButton
            ><ShButton href="/settings"
              >Manage settings</ShButton
            ></ShButtonGroup
          ></ShStack
        >
      </ShSection>
    </ShStack>
  </ShPage>
</template>
