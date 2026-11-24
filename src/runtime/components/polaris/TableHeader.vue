<template>
  <s-table-header v-if="polarisMounted" v-bind="polarisAttrs">
    <slot />
  </s-table-header>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

import type { ListSlotShorthand, TableFormat } from '../../types'
import { usePolarisAttrs } from './utils'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  listSlot?: ListSlotShorthand
  format?: TableFormat
}>()

const polarisAttrs = usePolarisAttrs(props)
</script>
