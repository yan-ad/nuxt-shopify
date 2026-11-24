<template>
  <s-table-body v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-table-body>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
