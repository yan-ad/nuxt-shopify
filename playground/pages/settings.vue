<script setup lang="ts">
import { defaultSettings, type PlaygroundSettings } from '../shared/settings'

definePageMeta({ middleware: 'shopify-auth', layout: 'auth' })
const { data, error, status, refresh } = await useAsyncData(
  'playground-settings',
  () => useShopifyFetch('/api/settings'),
  { server: false }
)
const form = reactive<PlaygroundSettings>({ ...defaultSettings })
const pageSize = computed({
  get: () => String(form.pageSize),
  set: (value) => {
    form.pageSize = Number(value)
  }
})
const saving = ref(false)
const saveError = ref('')
const saved = ref(false)
const dirty = computed(
  () =>
    Boolean(data.value) &&
    JSON.stringify(form) !== JSON.stringify(data.value?.data.settings)
)
watch(
  data,
  (value) => {
    if (value) Object.assign(form, value.data.settings)
  },
  { immediate: true }
)
async function save() {
  if (!data.value || saving.value) return
  saving.value = true
  saveError.value = ''
  saved.value = false
  try {
    const result = await useShopifyFetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        settings: { ...form },
        compareDigest: data.value.data.compareDigest
      })
    })
    data.value = { ...data.value, data: result.data }
    saved.value = true
  } catch (error) {
    saveError.value =
      error instanceof Error ? error.message : 'Unable to save preferences.'
  } finally {
    saving.value = false
  }
}
function discard() {
  if (data.value) Object.assign(form, data.value.data.settings)
  saved.value = false
  saveError.value = ''
}
</script>

<template>
  <ShPage heading="Settings">
    <ShStack gap="base">
      <p v-if="status === 'pending'" role="status">
        Loading saved preferences…
      </p>
      <ShBanner v-if="error" heading="Could not load settings" tone="critical"
        ><ShParagraph>{{ error.message }}</ShParagraph
        ><ShButton @click="refresh()">Try again</ShButton></ShBanner
      >
      <template v-else-if="data">
        <ShBanner
          v-if="saveError"
          heading="Settings were not saved"
          tone="critical"
          ><ShParagraph>{{ saveError }}</ShParagraph
          ><ShButton @click="refresh()"
            >Reload saved settings</ShButton
          ></ShBanner
        >
        <ShBanner
          v-if="saved && !dirty"
          heading="Settings saved to Shopify"
          tone="success"
          >These preferences will be used the next time you open
          Products.</ShBanner
        >
        <ShSection heading="Product list preferences">
          <ShParagraph
            >Stored on this app installation in Shopify, separately for each
            store.
            {{
              data.data.persisted
                ? 'Your saved preferences are loaded.'
                : 'No preferences have been saved yet.'
            }}</ShParagraph
          >
          <form @submit.prevent="save">
            <ShStack gap="base">
              <ShSelect
                v-model="pageSize"
                label="Products per page"
                :disabled="saving"
                ><ShOption value="10">10</ShOption
                ><ShOption value="20">20</ShOption
                ><ShOption value="50">50</ShOption></ShSelect
              >
              <ShSelect
                v-model="form.defaultStatus"
                label="Default product status"
                :disabled="saving"
                ><ShOption value="all">All statuses</ShOption
                ><ShOption value="active">Active</ShOption
                ><ShOption value="draft">Draft</ShOption
                ><ShOption value="archived">Archived</ShOption></ShSelect
              >
              <ShButtonGroup
                ><ShButton
                  type="submit"
                  variant="primary"
                  :loading="saving"
                  :disabled="saving || (!dirty && data.data.persisted)"
                  >Save preferences</ShButton
                ><ShButton :disabled="saving || !dirty" @click="discard"
                  >Discard changes</ShButton
                ></ShButtonGroup
              >
              <p role="status" aria-live="polite">
                {{
                  saving
                    ? 'Saving preferences…'
                    : dirty
                      ? 'You have unsaved changes.'
                      : ''
                }}
              </p>
            </ShStack>
          </form>
        </ShSection>
      </template>
    </ShStack>
  </ShPage>
</template>
