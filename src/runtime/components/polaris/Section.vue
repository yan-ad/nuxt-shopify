<template>
  <s-section v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-section>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityLabel?: string
  heading?: string
  padding?: 'base' | 'none'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
