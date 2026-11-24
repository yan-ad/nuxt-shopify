<template>
  <div>
    basic
    <DirectButton>Direct imported button</DirectButton>
    <ShEmptyState heading="Add your first product" data-testid="empty-state">
      <ShIcon slot="graphic" type="product" />
      <ShText slot="subheading">Add products to start selling.</ShText>
      <ShButton slot="primary-action" variant="primary">Add product</ShButton>
      <ShButton slot="secondary-actions" variant="secondary"
        >Import products</ShButton
      >
    </ShEmptyState>
    <ShProgress
      id="determinate"
      accessibility-label="Order fulfillment"
      :value="0"
      :max="5"
      tone="info"
    />
    <ShProgress id="indeterminate" accessibility-label="Importing products" />
    <ShNumber
      color="subdued"
      font-size="large"
      font-weight="bold"
      tone="success"
      >17,660</ShNumber
    >
    <ShThumbnail src="/product.png" alt="Product" loading="lazy" />
  </div>
</template>

<script setup>
import DirectButton from '../../../src/runtime/components/polaris/Button.vue'
</script>
