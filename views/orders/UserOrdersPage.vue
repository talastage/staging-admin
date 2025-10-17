<!-- components/UserOrders.vue -->
<template>
  <v-container>
    <div class="d-flex justify-space-between align-center mb-6">
      <h2 class="text-h5">Order History</h2>

      <!-- Optional: Add filters or sorting options here -->
      <v-menu v-if="orders.length">
        <template v-slot:activator="{ props }">
          <v-btn v-bind="props" icon="mdi-dots-vertical" variant="text" />
        </template>
        <v-list>
          <v-list-item
            v-for="(filter, index) in sortOptions"
            :key="index"
            :value="filter.value"
            @click="updateSort(filter.value)"
          >
            <v-list-item-title>{{ filter.label }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>

    <!-- Loading State (First Page) -->
    <div
      v-if="isLoading && page === 1"
      class="d-flex justify-center align-center"
      style="min-height: 200px"
    >
      <v-progress-circular indeterminate color="primary" />
    </div>

    <!-- Content -->
    <template v-else>
      <!-- No Orders State -->
      <v-card v-if="!isLoading && orders.length === 0" class="text-center pa-6">
        <v-icon size="64" color="grey-lighten-1" class="mb-4">
          mdi-receipt-text-outline
        </v-icon>
        <h3 class="text-h6 mb-2">No Orders Yet</h3>
        <p class="text-body-1 text-grey mb-4">
          Your order history will appear here once you make your first purchase.
        </p>
      </v-card>

      <!-- Orders List -->
      <div v-else class="orders-list">
        <OrderHistoryItem
          v-for="order in orders"
          :key="order.id"
          :order="order"
        />
      </div>

      <!-- Loading More Indicator -->
      <div v-if="isLoading && page > 1" class="d-flex justify-center my-4">
        <v-progress-circular indeterminate color="primary" />
      </div>

      <!-- Infinite Scroll Sentinel -->
      <div ref="sentinelRef" class="sentinel" />
    </template>

    <!-- Error Snackbar -->
    <v-snackbar v-model="showError" color="error" timeout="5000">
      {{ errorMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showError = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'

const { $axios } = useNuxtApp()

// State
const orders = ref([])
const hasMoreOrders = ref(true)
const showError = ref(false)
const errorMessage = ref('')
const page = ref(1)
const sortBy = ref('latest')

// Sort options
const sortOptions = [
  { label: 'Latest First', value: 'latest' },
  { label: 'Oldest First', value: 'oldest' },
  { label: 'Highest Amount', value: 'amount_desc' },
  { label: 'Lowest Amount', value: 'amount_asc' },
]

// Fetch orders with sorting and pagination
const fetchOrders = async (currentPage: number) => {
  try {
    const response = await $axios.get('/api/orders/history', {
      params: {
        page: currentPage,
        per_page: 10,
        sort: sortBy.value,
      },
    })

    const { data, current_page, last_page } = response.data

    if (currentPage === 1) {
      orders.value = data
    } else {
      orders.value = [...orders.value, ...data]
    }

    hasMoreOrders.value = current_page < last_page
    page.value = current_page
  } catch (error) {
    showError.value = true
    errorMessage.value = 'Failed to load orders. Please try again.'
    console.error('Error fetching orders:', error)
  }
}

// Initialize infinite scroll
const { sentinelRef, isLoading, initLoader } = useInfiniteLoader(
  fetchOrders,
  hasMoreOrders
)

// Update sort and refresh orders
const updateSort = async (newSort: string) => {
  sortBy.value = newSort
  page.value = 1
  orders.value = []
  await fetchOrders(1)
}

// Reset error state
const resetError = () => {
  showError.value = false
  errorMessage.value = ''
}

// Initialize component
onMounted(() => {
  initLoader()
})
</script>

<style scoped>
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sentinel {
  height: 20px;
  margin-top: 20px;
}
</style>

<script lang="ts">
// Types
interface Order {
  id: number
  reference: string
  total_amount: number
  currency_id: number
  order_type: string
  status: string
  created_at: string
  currency: {
    id: number
    code: string
    symbol: string
  }
}
</script>
