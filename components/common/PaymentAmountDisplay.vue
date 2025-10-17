<!-- components/payments/shared/PaymentAmountDisplay.vue -->
<template>
    <span :class="{ 'font-weight-bold': bold }">
      {{ formattedAmount }}
    </span>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    amount: number | string,
    currency: {
      code: string,
      symbol: string
    },
    bold?: boolean
  }>()
  
  const formattedAmount = computed(() => {
    const numAmount = Number(props.amount)
    return `${props.currency.symbol}${numAmount.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })} ${props.currency.code}`
  })
  </script>
  