<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { withDevtoolsTimeout } from '../shared/devtools-bridge'
import { findDevtoolsClient } from '../shared/devtools-client'
import { definePageMeta } from '#imports'

definePageMeta({ layout: false })
interface StoreInfo {
  shop: {
    name: string
    myshopifyDomain: string
    currencyCode: string
    primaryDomain: { url: string }
  }
  installedScopes: string[]
  configuration: {
    apiVersion: string
    appUrl: string
    distribution: string
    requestedScopes: string[]
  }
  session: {
    shop: string
    mode: string
    grantedScopes: string[]
    accessTokenExpires: string | null
    refreshTokenExpires: string | null
    refreshAvailable: boolean
  }
}
const data = ref<StoreInfo>()
const loading = ref(false)
const error = ref('')
async function refresh() {
  if (loading.value) return
  loading.value = true
  error.value = ''
  try {
    const client = findDevtoolsClient(window.parent, window.location.origin)
    if (!client)
      throw new Error(
        'The parent app transport is unavailable. Restart Nuxt, reload the app inside Shopify admin, then reopen DevTools.'
      )
    data.value = (await withDevtoolsTimeout(
      () => client(),
      22000,
      'The parent app did not respond within 22 seconds. Reload the Shopify app and retry.'
    )) as StoreInfo
  } catch (failure) {
    error.value =
      failure instanceof Error
        ? failure.message
        : 'Unable to load store information.'
  } finally {
    loading.value = false
  }
}
function date(value: string | null) {
  return value ? new Date(value).toLocaleString() : 'Not available'
}
onMounted(refresh)
</script>

<template>
  <main class="shopify-inspector">
    <header>
      <div>
        <p class="eyebrow">@yan-ad/nuxt-shopify · DEVELOPMENT</p>
        <h1>Store inspector</h1>
        <p>
          Live, read-only information from your authenticated Shopify
          installation.
        </p>
      </div>
      <button type="button" :disabled="loading" @click="refresh">
        {{ loading ? 'Loading…' : 'Refresh store' }}
      </button>
    </header>
    <p role="status" aria-live="polite">
      {{ loading ? 'Fetching store information…' : '' }}
    </p>
    <section v-if="error" role="alert" class="error">
      <h2>Could not connect</h2>
      <p>{{ error }}</p>
    </section>
    <template v-if="data">
      <section>
        <h2>{{ data.shop.name }}</h2>
        <dl>
          <dt>Store</dt>
          <dd>{{ data.shop.myshopifyDomain }}</dd>
          <dt>Currency</dt>
          <dd>{{ data.shop.currencyCode }}</dd>
          <dt>Storefront</dt>
          <dd>
            <a
              :href="data.shop.primaryDomain.url"
              target="_blank"
              rel="noopener noreferrer"
              >{{ data.shop.primaryDomain.url }}</a
            >
          </dd>
        </dl>
      </section>
      <section>
        <h2>Authentication</h2>
        <dl>
          <dt>Token mode</dt>
          <dd>{{ data.session.mode }}</dd>
          <dt>Access token expires</dt>
          <dd>{{ date(data.session.accessTokenExpires) }}</dd>
          <dt>Refresh token expires</dt>
          <dd>{{ date(data.session.refreshTokenExpires) }}</dd>
          <dt>Refresh available</dt>
          <dd>{{ data.session.refreshAvailable ? 'Yes' : 'No' }}</dd>
        </dl>
        <p>Credential values are never returned by this inspector.</p>
      </section>
      <section>
        <h2>Configuration</h2>
        <dl>
          <dt>Admin API version</dt>
          <dd>{{ data.configuration.apiVersion }}</dd>
          <dt>Distribution</dt>
          <dd>{{ data.configuration.distribution }}</dd>
          <dt>App URL</dt>
          <dd>{{ data.configuration.appUrl }}</dd>
        </dl>
      </section>
      <section>
        <h2>Installed access scopes</h2>
        <ul>
          <li v-for="scope in data.installedScopes" :key="scope">
            <code>{{ scope }}</code>
          </li>
        </ul>
        <p v-if="!data.installedScopes.length">No scopes returned.</p>
        <details>
          <summary>Requested scopes</summary>
          <pre>{{
            data.configuration.requestedScopes.join('\n') || 'None configured'
          }}</pre>
        </details>
      </section>
    </template>
  </main>
</template>

<style scoped>
.shopify-inspector {
  color-scheme: light dark;
  font:
    14px/1.6 system-ui,
    sans-serif;
  padding: 24px;
  max-width: 1100px;
  margin: auto;
  color: light-dark(#202223, #eee);
}
header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
h1 {
  font-size: 28px;
  margin: 0;
}
h2 {
  margin: 0 0 16px;
  font-size: 18px;
}
p {
  margin: 8px 0;
}
.eyebrow {
  font-size: 11px;
  color: light-dark(#526b36, #b0d68b);
}
section {
  border: 1px solid light-dark(#ddd, #444);
  padding: 20px;
  border-radius: 12px;
  margin-block: 18px;
}
.error {
  border-color: #b42318;
}
dl {
  display: grid;
  grid-template-columns: 180px minmax(0, 1fr);
  gap: 10px;
}
dt {
  opacity: 0.7;
}
dd {
  margin: 0;
  overflow-wrap: anywhere;
}
button {
  border: 1px solid currentColor;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  padding: 8px 14px;
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: wait;
}
button:focus-visible,
a:focus-visible,
summary:focus-visible {
  outline: 2px solid #78a84b;
  outline-offset: 3px;
}
ul {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  list-style: none;
  padding: 0;
}
li {
  border: 1px solid light-dark(#ddd, #444);
  border-radius: 6px;
  padding: 3px 8px;
}
pre {
  overflow: auto;
}
@media (max-width: 560px) {
  .shopify-inspector {
    padding: 16px;
  }
  dl {
    grid-template-columns: 1fr;
    gap: 4px;
  }
  dd {
    margin-bottom: 8px;
  }
}
</style>
