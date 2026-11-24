<template>
  <s-table-row v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-table-row>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  clickDelegate?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
