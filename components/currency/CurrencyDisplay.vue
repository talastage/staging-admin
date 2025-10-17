<!-- components/CurrencyDisplay.vue -->
<template>
  <span class="currency-display" :title="`${name} (${code})`">
    <span class="currency-symbol">{{ symbol }}</span>
  </span>
</template>

<script setup lang="ts">
defineProps({
  symbol: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
});
</script>

<style scoped>
.currency-display {
  display: inline-flex;
  align-items: center;
}
.currency-symbol {
  font-weight: 500;
  margin-right: 4px;
}
</style>
