<template>
  <ui-nav-menu v-if="!standalone" v-bind="$attrs">
    <slot />
  </ui-nav-menu>
</template>

<script setup lang="ts">
import { useNuxtApp } from '#app'

const standalone =
  import.meta.dev && Boolean(useNuxtApp().payload.shopifyStandalone)

defineOptions({ inheritAttrs: false })
</script>
