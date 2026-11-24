<template>
  <s-tooltip v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-tooltip>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
