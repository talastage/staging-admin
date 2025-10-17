<template>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>Charges</v-list-item-title>
      <v-list-item-subtitle
        >{{ currencySymbol }}{{ chargeAmount.toFixed(2) }}</v-list-item-subtitle
      >
    </v-list-item-content>
  </v-list-item>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps({
  amount: {
    type: Number,
    required: true,
  },
  paymentMethod: {
    type: Object,
    required: true,
  },
  currencySymbol: {
    type: String,
    default: "$",
  },
});

const chargeAmount = computed(() => {
  // Calculate charge based on amount and payment method
  // This is a placeholder calculation, adjust based on your actual charge logic
  const baseCharge = props.amount * 0.02; // Assuming 2% base charge
  const methodCharge = props.paymentMethod.additionalCharge || 0;
  return baseCharge + methodCharge;
});
</script>
