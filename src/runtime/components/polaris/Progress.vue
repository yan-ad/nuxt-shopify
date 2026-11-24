<template>
  <s-progress v-if="polarisMounted" v-bind="polarisAttrs" />
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

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
