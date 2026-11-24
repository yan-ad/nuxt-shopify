<template>
  <s-table-cell v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-table-cell>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
