<template>
  <s-progress v-bind="polarisAttrs" />
</template>

<script setup lang="ts">
import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityLabel?: string
  max?: number
  tone?:
    | 'auto'
    | 'neutral'
    | 'info'
    | 'success'
    | 'caution'
    | 'warning'
    | 'critical'
  value?: number
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
