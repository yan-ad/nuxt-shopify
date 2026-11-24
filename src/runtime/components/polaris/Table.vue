<template>
  <s-table v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-table>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  variant?: 'auto' | 'list'
  loading?: boolean
  paginate?: boolean
  hasPreviousPage?: boolean
  hasNextPage?: boolean
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
