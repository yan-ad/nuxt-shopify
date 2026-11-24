<template>
  <s-spinner v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-spinner>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityLabel?: string
  size?: 'base' | 'large' | 'large-100'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
