<template>
  <s-empty-state v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-empty-state>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  heading?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
