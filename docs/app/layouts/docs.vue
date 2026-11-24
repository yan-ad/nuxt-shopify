<script setup lang="ts">
const route = useRoute()
const fullWidth = computed(
  () => route.path === '/components' || route.path.startsWith('/components/')
)

// Keep Docus's deferred sidebar hydration behavior when navigating.
const asideKey = ref(route.path)
const isAsideHydrated = ref(false)
watch(
  () => route.path,
  (path) => {
    if (!isAsideHydrated.value) asideKey.value = path
  }
)
</script>

<template>
  <UMain :class="{ 'components-layout': fullWidth }">
    <UContainer :class="fullWidth ? 'max-w-none' : undefined">
      <UPage>
        <template #left>
          <UPageAside>
            <DocsAsideLeftTop />
            <LazyDocsAsideLeftBody
              :key="asideKey"
              hydrate-on-media-query="(min-width: 64rem)"
              @hydrated="isAsideHydrated = true"
            />
          </UPageAside>
        </template>
        <slot />
      </UPage>
    </UContainer>
  </UMain>
</template>

<style scoped>
.components-layout :deep([data-slot='center']) {
  min-width: 0;
}
.components-layout :deep(.prose) {
  max-width: none;
}
</style>
