<template>
  <s-table-header-row v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-table-header-row>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
