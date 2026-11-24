<template>
  <s-heading v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-heading>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityRole?: 'none' | 'presentation' | 'heading'
  lineClamp?: number
  accessibilityVisibility?: 'visible' | 'hidden' | 'exclusive'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
