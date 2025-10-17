<!-- components/payments/shared/PaymentStatusChip.vue -->
<template>
    <v-chip
      :color="statusColor"
      size="small"
      :text-color="textColor"
    >
      {{ formatStatus(status) }}
    </v-chip>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue'
  
  const props = defineProps<{
    status: string
  }>()
  
  const statusColor = computed(() => {
    const colors = {
      pending: 'warning',
      processing: 'info',
      completed: 'success',
      failed: 'error',
      cancelled: 'grey',
      refunded: 'purple'
    }
    return colors[props.status] || 'grey'
  })
  
  const textColor = computed(() => {
    return props.status === 'pending' ? 'black' : 'white'
  })
  
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1)
  }
  </script>
  