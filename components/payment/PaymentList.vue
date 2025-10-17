<!-- components/payments/PaymentList.vue -->
<template>
  <div class="payment-list">
    <PaymentListItem
      v-for="payment in payments"
      :key="payment.reference"
      :payment="payment"
    />
  </div>
</template>

<script setup lang="ts">
interface Payment {
  reference: string
  amount: string
  status: string
  payment_type: string
  created_at: string
  currency: {
    code: string
    symbol: string
  }
  payment_method: {
    id: number
    name: string
    logo_url: string | null
  }
  order: {
    reference: string
    status: string
    total_amount: string
    completed_at: string
  }
  project?: {
    id: number
    name: string
    thumbnail_url: string
  }
  recipient?: {
    id: number
    display_name: string
    profile_photo: string
  }
}

defineProps<{
  payments: Payment[]
  loading: boolean
}>()
</script>
