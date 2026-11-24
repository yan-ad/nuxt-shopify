<template>
  <ui-nav-menu v-if="polarisMounted && !standalone" v-bind="$attrs">
    <slot />
  </ui-nav-menu>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { useNuxtApp } from '#app'

const standalone =
  import.meta.dev && Boolean(useNuxtApp().payload.shopifyStandalone)

defineOptions({ inheritAttrs: false })
</script>
