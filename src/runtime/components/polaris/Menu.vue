<template>
  <s-menu v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-menu>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  accessibilityLabel?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
