<template>
  <s-option-group v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-option-group>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  disabled?: boolean
  label?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
