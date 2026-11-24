<template>
  <s-empty-state v-bind="polarisAttrs">
    <slot />
  </s-empty-state>
</template>

<script setup lang="ts">
import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  heading?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
