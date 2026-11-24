<template>
  <s-number v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-number>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityVisibility?: 'visible' | 'hidden' | 'exclusive'
  color?: 'base' | 'subdued'
  dir?: '' | 'auto' | 'ltr' | 'rtl'
  fontSize?:
    | 'small-200'
    | 'small-100'
    | 'small'
    | 'base'
    | 'large'
    | 'large-100'
    | 'auto'
  fontWeight?: 'base' | 'auto' | 'medium' | 'semibold' | 'bold'
  tone?:
    | 'auto'
    | 'neutral'
    | 'info'
    | 'success'
    | 'caution'
    | 'warning'
    | 'critical'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
