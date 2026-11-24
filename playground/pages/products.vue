<script setup lang="ts">
import { defaultSettings } from '../shared/settings'

definePageMeta({ middleware: 'shopify-auth', layout: 'auth' })
const search = ref('')
const access = ref('')
const checkingAccess = ref(false)
async function checkAccess() {
  checkingAccess.value = true
  try {
    const result = await useShopifyFetch('/api/access')
    access.value = JSON.stringify(result.data, null, 2)
  } catch (error) {
    access.value =
      error instanceof Error ? error.message : 'Access check failed'
  } finally {
    checkingAccess.value = false
  }
}
const status = ref('all')
const pageSize = ref(defaultSettings.pageSize)
const cursor = ref<string | null>(null)
const history = ref<Array<string | null>>([])
const { data: preferences, error: preferencesError } = await useAsyncData(
  'product-preferences',
  () => useShopifyFetch('/api/settings'),
  { server: false }
)
watch(
  preferences,
  (value) => {
    if (value) {
      pageSize.value = value.data.settings.pageSize
      status.value = value.data.settings.defaultStatus
    }
  },
  { immediate: true }
)
const appliedSearch = ref('')
const {
  data,
  status: requestStatus,
  error,
  refresh
} = await useAsyncData(
  'products',
  () =>
    useShopifyFetch('/api/products', {
      query: {
        first: pageSize.value,
        after: cursor.value,
        search: appliedSearch.value,
        status: status.value
      }
    }),
  { server: false, watch: [cursor, appliedSearch, status, pageSize] }
)
const products = computed(() => data.value?.data)
const loading = computed(() => requestStatus.value === 'pending')
function resetPage() {
  history.value = []
  cursor.value = null
}
function filter() {
  resetPage()
  appliedSearch.value = search.value.trim()
  refresh()
}
function next() {
  if (!loading.value && products.value?.pageInfo.hasNextPage) {
    history.value.push(cursor.value)
    cursor.value = products.value.pageInfo.endCursor
  }
}
function previous() {
  if (!loading.value && history.value.length)
    cursor.value = history.value.pop() ?? null
}
function productUrl(id: string) {
  return `shopify://admin/products/${id.split('/').pop()}`
}
</script>

<template>
  <ShPage heading="Products">
    <ShButton slot="secondary-actions" :loading="loading" @click="refresh()"
      >Refresh</ShButton
    >
    <ShStack gap="base">
      <ShBanner
        v-if="preferencesError"
        heading="Preferences unavailable"
        tone="warning"
        >Using the initial list preferences. Your products still come directly
        from Shopify. Open Settings to retry loading saved
        preferences.</ShBanner
      >
      <ShSection heading="Store catalog">
        <form @submit.prevent="filter">
          <ShStack direction="inline" gap="base">
            <ShSearchField
              v-model="search"
              label="Search product titles"
              placeholder="Product title"
              :disabled="loading"
            />
            <ShSelect
              v-model="status"
              label="Status"
              :disabled="loading"
              @change="resetPage"
            >
              <ShOption value="all">All statuses</ShOption
              ><ShOption value="active">Active</ShOption
              ><ShOption value="draft">Draft</ShOption
              ><ShOption value="archived">Archived</ShOption>
            </ShSelect>
            <ShButton type="submit" :disabled="loading">Search</ShButton>
          </ShStack>
        </form>
      </ShSection>
      <ShBanner v-if="error" heading="Could not load products" tone="critical">
        <ShParagraph>{{ error.message }}</ShParagraph>
        <ShButton @click="refresh()">Try again</ShButton>
        <ShButton :loading="checkingAccess" @click="checkAccess"
          >Check installed access</ShButton
        >
        <pre v-if="access" role="status">{{ access }}</pre>
      </ShBanner>
      <ShSection v-else heading="Products from Shopify">
        <p v-if="loading" role="status">Loading products…</p>
        <ShTable
          :loading="loading"
          paginate
          :has-next-page="Boolean(products?.pageInfo.hasNextPage)"
          :has-previous-page="history.length > 0"
          @nextpage="next"
          @previouspage="previous"
        >
          <ShTableHeaderRow
            ><ShTableHeader list-slot="primary">Product</ShTableHeader
            ><ShTableHeader>Status</ShTableHeader
            ><ShTableHeader>Vendor</ShTableHeader></ShTableHeaderRow
          >
          <ShTableBody>
            <ShTableRow v-for="product in products?.nodes" :key="product.id">
              <ShTableCell
                ><ShStack direction="inline" gap="small"
                  ><ShLink :href="productUrl(product.id)">{{
                    product.title
                  }}</ShLink></ShStack
                ></ShTableCell
              >
              <ShTableCell
                ><ShBadge
                  color="base"
                  :tone="product.status === 'ACTIVE' ? 'success' : 'neutral'"
                  >{{ product.status.toLowerCase() }}</ShBadge
                ></ShTableCell
              >
              <ShTableCell>{{ product.vendor || '—' }}</ShTableCell>
            </ShTableRow>
            <ShEmptyState
              v-if="!loading && products && !products.nodes.length"
              heading="No products found"
              ><ShText slot="subheading"
                >Try another title or status, or add products in Shopify
                admin.</ShText
              ></ShEmptyState
            >
          </ShTableBody>
        </ShTable>
        <p v-if="products" role="status">
          {{ products.nodes.length }} products on this page · {{ pageSize }} per
          page
        </p>
      </ShSection>
    </ShStack>
  </ShPage>
</template>
