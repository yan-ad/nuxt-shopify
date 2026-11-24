<template>
  <slot />
  <ShAppNav v-if="navLinks.length && !standalone">
    <ShLink
      v-for="link in navLinks"
      :key="link.href"
      :href="link.href"
      :rel="link.rel"
    >
      {{ link.label }}
    </ShLink>
  </ShAppNav>
</template>

<script setup lang="ts">
import { useRuntimeConfig, useNuxtApp } from '#app'
import type { NavLink } from '../../types'

const props = defineProps<{
  /** Override the nav links from module config */
  links?: NavLink[]
}>()

const standalone =
  import.meta.dev && Boolean(useNuxtApp().payload.shopifyStandalone)

const config = useRuntimeConfig().public.shopify
const navLinks = props.links || (config.navLinks as NavLink[]) || []
</script>
