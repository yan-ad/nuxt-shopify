<template>
  <s-list-item v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-list-item>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
