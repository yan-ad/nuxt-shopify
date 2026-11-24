<template>
  <s-unordered-list v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-unordered-list>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
