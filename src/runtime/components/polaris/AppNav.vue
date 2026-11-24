<template>
  <s-app-nav v-if="!standalone" v-bind="$attrs">
    <slot />
  </s-app-nav>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'

const standalone =
  import.meta.dev && Boolean(useNuxtApp().payload.shopifyStandalone)

defineOptions({ inheritAttrs: false })
</script>
