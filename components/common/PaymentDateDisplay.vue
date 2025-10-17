<!-- components/payments/shared/PaymentDateDisplay.vue -->
<template>
    <span :title="fullDate">{{ formattedDate }}</span>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    date: string
  }>()
  
  const formattedDate = computed(() => {
    return new Date(props.date).toLocaleDateString()
  })
  
  const fullDate = computed(() => {
    return new Date(props.date).toLocaleString()
  })
  </script>
  