<template>
  <div v-if="payable">
    <CartPayableUser v-if="payable.first_name" :payable="payable" />
    <CartPayableProject v-else :payable="payable" />
  </div>
</template>

<script setup>
import { defineProps } from "vue";

const props = defineProps({
  payable: Object,
});
</script>

<style scoped>
/* Add any specific styles for CartPayable here */
</style>
