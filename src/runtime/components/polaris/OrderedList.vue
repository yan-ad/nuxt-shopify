<template>
  <s-ordered-list v-if="polarisMounted" v-bind="$attrs">
    <slot />
  </s-ordered-list>
</template>

<script setup lang="ts">
import { usePolarisClient } from '../../shared/polaris-client'

const polarisMounted = usePolarisClient()

defineOptions({ inheritAttrs: false })
</script>
