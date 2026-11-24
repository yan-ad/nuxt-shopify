<template>
  <s-query-container v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-query-container>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  containerName?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
