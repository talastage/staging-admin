<!-- pages/orders/order-[reference].vue -->
<template>
  <v-container class="pa-10">
    <v-card>
      <v-card-title class="text-h4 font-weight-bold">
        Order Details
      </v-card-title>
      <v-card-text v-if="loading">
        <v-skeleton-loader type="text" />
      </v-card-text>
      <v-card-text v-else-if="error">
        <p class="red--text">{{ error }}</p>
      </v-card-text>
      <v-card-text v-else-if="order">
        <p><strong>Reference:</strong> {{ order.reference }}</p>
        <p><strong>Status:</strong> {{ order.status }}</p>
        <p><strong>Total Amount:</strong> {{ order.total_amount }}</p>
        <!-- More order details as needed -->
        <v-btn color="primary" @click="$router.push('/')"> Go to Home </v-btn>
      </v-card-text>
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'

const route = useRoute()
const { $axios } = useNuxtApp()

const order = ref(null)
const error = ref('')
const loading = ref(true)

// Extract the order reference from the URL.
const reference = route.params.reference?.toString() || route.query.reference

onMounted(async () => {
  try {
    // Assume you have an API endpoint to fetch order by reference:
    const response = await $axios.get(`/api/orders/by-reference/${reference}`)
    order.value = response.data.data
  } catch (err: any) {
    error.value = err.response?.data?.message || 'Failed to load order details'
  } finally {
    loading.value = false
  }
})
</script>
