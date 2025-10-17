<template>
  <v-card elevation="0" border>
    <v-card-title class="d-flex align-center px-4 py-3 bg-grey-lighten-4">
      <v-icon icon="mdi-history" class="mr-2" />
      <span class="text-h6">Balance History</span>
      <v-spacer />
      <v-chip v-if="totalItems" size="small" color="primary" variant="flat">
        {{ totalItems }} transactions
      </v-chip>
    </v-card-title>

    <v-divider />

    <!-- Loading State (Initial) -->
    <v-card-text v-if="initialLoading" class="pa-4">
      <v-sheet
        v-for="n in 3"
        :key="n"
        class="mb-4 pa-4 rounded-lg bg-grey-lighten-4"
      >
        <v-skeleton-loader type="list-item-two-line" />
      </v-sheet>
    </v-card-text>

    <!-- Empty State -->
    <v-card-text v-else-if="!items.length && !initialLoading">
      <v-alert type="info" variant="tonal" border="start" class="mb-0">
        <template #prepend>
          <v-icon icon="mdi-information" />
        </template>
        No balance history found.
      </v-alert>
    </v-card-text>

    <!-- Transaction List -->
    <v-card-text v-else class="pa-0">
      <v-list>
        <template v-for="(item, index) in items" :key="item.id">
          <v-list-item
            :ripple="false"
            class="py-4 px-4"
            :class="{ 'bg-grey-lighten-4': index % 2 === 0 }"
          >
            <template #prepend>
              <v-avatar
                :color="getStatusColor(item.status)"
                size="42"
                class="mr-3"
              >
                <v-icon icon="mdi-swap-horizontal" />
              </v-avatar>
            </template>

            <v-list-item-title class="font-weight-medium mb-1">
              {{ formatAmount(item.amount, item.currency.symbol) }}
            </v-list-item-title>

            <v-list-item-subtitle class="text-caption d-flex align-center">
              <v-icon
                size="16"
                icon="mdi-clock-outline"
                class="mr-1"
                color="grey-darken-1"
              />
              {{ formatDateTime(item.date, item.time) }}
            </v-list-item-subtitle>

            <template #append>
              <v-chip
                :color="getStatusColor(item.status)"
                size="small"
                variant="flat"
                class="text-capitalize"
              >
                {{ item.status }}
              </v-chip>
            </template>
          </v-list-item>
        </template>

        <!-- Sentinel element for infinite scrolling -->
        <div ref="sentinelRef" class="sentinel-element py-2">
          <div v-if="isLoading && !initialLoading" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </div>

        <!-- End of List Indicator -->
        <div
          v-if="!hasMore && items.length > 0"
          class="pa-4 text-center text-caption text-grey"
        >
          End of history
        </div>
      </v-list>
    </v-card-text>

    <!-- Error State -->
    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ error?.message || 'Failed to load balance history' }}
      <template v-slot:actions>
        <v-btn variant="text" @click="refresh">Retry</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'

interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface Transaction {
  id: number
  transaction_type: string
  amount: string
  currency: Currency
  date: string
  time: string
  status: string
}

interface HistoryResponse {
  data: Transaction[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

const props = defineProps<{
  accessUuid: string
  investorId: string
}>()

const emit = defineEmits<{
  'update:history': [history: Transaction[]]
  'update:loading': [loading: boolean]
  'update:total': [total: number]
}>()

const { $axios } = useNuxtApp()
const { formatLocalDateTime } = useDateFormatter()

// State
const items = ref<Transaction[]>([])
const initialLoading = ref(true)
const error = ref<Error | null>(null)
const showError = ref(false)
const hasMore = ref(true)
const totalItems = ref(0)

// Computed URL
const apiUrl = computed(
  () =>
    `/api/projects/${props.accessUuid}/earnings/investors/${props.investorId}/balance-history`
)

// Helper functions
const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    completed: 'success',
    pending: 'warning',
    failed: 'error',
  }
  return colors[status] || 'grey'
}

const formatAmount = (amount: string, symbol: string): string => {
  return `${symbol} ${amount}`
}

const formatDateTime = (date: string, time: string): string => {
  return formatLocalDateTime(`${date} ${time}`)
}

// Fetch history function for infinite loader
const fetchHistoryPage = async (page: number): Promise<Transaction[]> => {
  try {
    const { data } = await $axios.get<HistoryResponse>(apiUrl.value, {
      params: { page },
    })

    // If it's the first page, replace the items array
    if (page === 1) {
      items.value = data.data
    } else {
      // Otherwise append to existing data
      items.value = [...items.value, ...data.data]
    }

    totalItems.value = data.meta.total
    hasMore.value = data.meta.current_page < data.meta.last_page

    // Update the parent component
    emit('update:history', items.value)
    emit('update:total', totalItems.value)

    return data.data
  } catch (err) {
    error.value =
      err instanceof Error ? err : new Error('Failed to load balance history')
    showError.value = true
    console.error('Error fetching balance history:', err)
    throw error.value
  } finally {
    initialLoading.value = false
  }
}

// Initialize infinite loader
const { sentinelRef, isLoading, initLoader, page } = useInfiniteLoader(
  fetchHistoryPage,
  hasMore,
  { immediate: false } // We'll manually call initLoader after component setup
)

// Watch for loading state changes and emit them
watchEffect(() => {
  emit('update:loading', isLoading.value)
})

// Refresh data
function refresh() {
  hasMore.value = true
  error.value = null
  initialLoading.value = true
  initLoader()
}

// Initialize on mount
onMounted(() => {
  initLoader()
})
</script>

<style scoped>
.v-list-item {
  transition: background-color 0.2s ease;
}

.v-list-item:hover {
  background-color: rgb(var(--v-theme-primary), 0.05) !important;
}

.sentinel-element {
  min-height: 10px;
}
</style>
