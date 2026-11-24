<template>
  <s-page v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-page>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import type { SizeKeyword } from '../../types'
import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  inlineSize?: Extract<SizeKeyword, 'base' | 'large' | 'small'>
  heading?: string
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
