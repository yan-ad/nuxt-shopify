<template>
  <s-choice v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-choice>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  disabled?: boolean
  selected?: boolean
  value?: string
  accessibilityLabel?: string
  defaultSelected?: boolean
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
