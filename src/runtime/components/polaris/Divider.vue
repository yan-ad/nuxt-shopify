<template>
  <s-divider v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-divider>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import type { MaybeResponsive } from '../../types'
import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  direction?: MaybeResponsive<'block' | 'inline'>
  color?: 'base' | 'strong'
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
