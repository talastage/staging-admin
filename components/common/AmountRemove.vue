<template>
    <p>
      {{ currencyFormatter(amount, currency.symbol) }}
    </p>
  </template>
  
  <script setup>
  import { useCurrencyFormatter } from "@/composables/useCurrencyFormatter";
  import { defineProps } from "vue";
  
  const props = defineProps({
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: Object,
      required: true,
    },
  });
  
  const { currencyFormatter } = useCurrencyFormatter();
  </script>
  