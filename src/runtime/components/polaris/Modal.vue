<template>
  <s-modal v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
    <slot name="primary-action" />
    <slot name="secondary-actions" />
  </s-modal>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  heading?: string
  accessibilityLabel?: string
  padding?: 'base' | 'none'
  size?: 'small' | 'small-100' | 'base' | 'large' | 'large-100'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
