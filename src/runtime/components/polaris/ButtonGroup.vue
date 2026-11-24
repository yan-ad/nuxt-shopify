<template>
  <s-button-group v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-button-group>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  gap?: 'base' | 'none'
  accessibilityLabel?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
