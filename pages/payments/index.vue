<template>
  <v-container class="payments-page">
    <UserPaymentsPage />
  </v-container>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()

// Handle redirect from payment gateway
const txRef = route.query.tx_ref as string
const transactionId = route.query.transaction_id as string
const status = route.query.status as string

// If coming from payment gateway, redirect to specific payment page
if (txRef) {
  const query = {
    ...(status && { status }),
    ...(transactionId && { transaction_id: transactionId }),
    tx_ref: txRef
  }
  
  router.replace({
    path: `/payments/payment-${txRef}`,
    query
  })
}
</script>

<style scoped>
.payments-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}
</style>