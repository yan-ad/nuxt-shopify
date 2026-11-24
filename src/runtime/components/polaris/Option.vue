<template>
  <s-option v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-option>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  selected?: boolean
  defaultSelected?: boolean
  value?: string
  disabled?: boolean
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
