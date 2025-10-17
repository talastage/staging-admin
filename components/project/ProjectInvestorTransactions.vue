<template>
  <v-card elevation="0" border>
    <v-card-title class="d-flex align-center px-4 py-3 bg-grey-lighten-4">
      <v-icon icon="mdi-bank-transfer" class="mr-2" />
      <span class="text-h6">Transaction History</span>
      <v-spacer />
      <v-chip
        v-if="totalTransactions"
        size="small"
        color="primary"
        variant="flat"
      >
        {{ totalTransactions }} transactions
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text v-if="initialLoading" class="pa-4">
      <v-sheet
        v-for="n in 3"
        :key="n"
        class="mb-4 pa-4 rounded-lg bg-grey-lighten-4"
      >
        <v-skeleton-loader type="list-item-avatar, text@2" />
      </v-sheet>
    </v-card-text>

    <v-card-text v-else-if="!transactions.length && !initialLoading">
      <v-alert type="info" variant="tonal" border="start" class="mb-0">
        <template #prepend>
          <v-icon icon="mdi-information" />
        </template>
        No transactions found.
      </v-alert>
    </v-card-text>

    <template v-else>
      <v-list>
        <v-list-item
          v-for="(transaction, index) in transactions"
          :key="transaction.id"
          :class="{ 'bg-grey-lighten-4': index % 2 !== 0 }"
        >
          <template v-slot:prepend>
            <v-avatar :color="getStatusColor(transaction.status)" size="48">
              <v-icon icon="mdi-bank-transfer" size="32" />
            </v-avatar>
          </template>

          <v-list-item-title class="font-weight-medium">
            {{
              formatLocalDateTime(
                transaction.created_at || transaction.timestamps?.created_at
              )
            }}
          </v-list-item-title>
          <v-list-item-subtitle class="text-caption text-grey">
            {{
              formatRelativeDate(
                transaction.created_at || transaction.timestamps?.created_at
              )
            }}
          </v-list-item-subtitle>

          <v-list-item-subtitle>
            <span class="text-caption text-grey">Status:</span>
            <v-chip
              :color="getStatusColor(transaction.status)"
              size="small"
              variant="flat"
              class="ml-1 text-capitalize"
            >
              {{ transaction.status }}
            </v-chip>
          </v-list-item-subtitle>

          <v-list-item-subtitle class="mt-2">
            <v-row>
              <v-col cols="12" sm="4" class="text-start">
                <div class="text-caption text-grey mb-1">Gross Amount</div>
                <div class="font-weight-medium">
                  {{
                    currencyFormatter(
                      transaction.gross_amount,
                      transaction.currency.symbol,
                      transaction.currency.code
                    )
                  }}
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="text-start">
                <div class="text-caption text-grey mb-1">Net Amount</div>
                <div class="font-weight-medium">
                  {{
                    currencyFormatter(
                      transaction.net_amount,
                      transaction.currency.symbol,
                      transaction.currency.code
                    )
                  }}
                </div>
              </v-col>
              <v-col cols="12" sm="4" class="text-start">
                <div class="text-caption text-grey mb-1">Service Fee</div>
                <div class="font-weight-medium">
                  {{
                    currencyFormatter(
                      transaction.app_service_fee,
                      transaction.currency.symbol,
                      transaction.currency.code
                    )
                  }}
                </div>
              </v-col>
            </v-row>
          </v-list-item-subtitle>

          <v-list-item-subtitle
            v-if="
              transaction.metadata &&
              (transaction.metadata.transaction_reference ||
                transaction.metadata.description)
            "
            class="mt-2"
          >
            <v-divider class="mb-2" />
            <div v-if="transaction.metadata.transaction_reference">
              <span class="text-caption text-grey">Reference:</span>
              <span class="font-weight-medium">{{
                transaction.metadata.transaction_reference
              }}</span>
            </div>
            <div v-if="transaction.metadata.description">
              <span class="text-caption text-grey">Description:</span>
              <span class="font-weight-medium">{{
                transaction.metadata.description
              }}</span>
            </div>
          </v-list-item-subtitle>
        </v-list-item>

        <!-- Sentinel element for infinite scrolling -->
        <div ref="sentinelRef" class="sentinel-element py-2">
          <div v-if="isLoading" class="text-center py-4">
            <v-progress-circular indeterminate color="primary" />
          </div>
        </div>

        <div
          v-if="!hasMore && transactions.length > 0"
          class="pa-4 text-center"
        >
          <v-chip color="grey" size="small" variant="flat">
            No more transactions
          </v-chip>
        </div>
      </v-list>
    </template>

    <v-snackbar v-model="showError" color="error" timeout="3000">
      {{ error?.message || 'Failed to load transactions' }}
      <template v-slot:actions>
        <v-btn variant="text" @click="refresh">Retry</v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watchEffect, onMounted } from 'vue'
import { useCurrencyFormatter } from '~/composables/useCurrencyFormatter'
import { useDateFormatter } from '~/composables/useDateFormatter'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'

interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface Timestamps {
  created_at: string
  processed_at: string
  updated_at: string
}

interface Transaction {
  id: number
  project_investor_id: number
  gross_amount: number
  net_amount: number
  app_service_fee: number
  status: string
  currency: Currency
  created_at?: string
  updated_at?: string
  processed_at?: string
  timestamps?: Timestamps
  share_percentage: number
  metadata?: {
    transaction_reference: string | null
    description: string | null
    source: string | null
    source_id: string | null
  } | null
}

interface TransactionResponse {
  data: Transaction[]
  meta: {
    current_page: number[]
    last_page: number[]
    per_page: number[]
    total: number[]
    from: number
    to: number
    links: Array<{ url: string | null; label: string; active: boolean }>
    path: string
  }
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
}

const props = defineProps<{
  accessUuid: string
  investorId: string
}>()

const emit = defineEmits<{
  'update:transactions': [transactions: Transaction[]]
  'update:loading': [loading: boolean]
  'update:total': [total: number]
}>()

const { $axios } = useNuxtApp()
const { currencyFormatter } = useCurrencyFormatter()
const { formatLocalDateTime, formatRelativeDate } = useDateFormatter()

// State
const transactions = ref<Transaction[]>([])
const totalTransactions = ref<number>(0)
const initialLoading = ref(true)
const error = ref<Error | null>(null)
const showError = ref(false)
const hasMore = ref(true)

// Computed URL
const apiUrl = computed(
  () =>
    `/api/projects/${props.accessUuid}/earnings/investors/${props.investorId}/transactions`
)

// Fetch transactions function for infinite loader
const fetchTransactionsPage = async (page: number): Promise<void> => {
  try {
    const { data } = await $axios.get<TransactionResponse>(apiUrl.value, {
      params: { page },
    })

    // If it's the first page, replace the transactions array
    if (page === 1) {
      transactions.value = data.data
    } else {
      // Otherwise append to existing data
      transactions.value = [...transactions.value, ...data.data]
    }

    totalTransactions.value = data.meta.total[0]
    hasMore.value = data.meta.current_page[0] < data.meta.last_page[0]

    // Update the parent component
    emit('update:transactions', transactions.value)
    emit('update:total', totalTransactions.value)

    return data.data
  } catch (err) {
    error.value =
      err instanceof Error ? err : new Error('Failed to load transactions')
    showError.value = true
    console.error('Error fetching transactions:', err)
    throw error.value
  } finally {
    initialLoading.value = false
  }
}

// Initialize infinite loader
const { sentinelRef, isLoading, initLoader, page } = useInfiniteLoader(
  fetchTransactionsPage,
  hasMore,
  { immediate: false } // We'll manually call initLoader after component setup
)

// Watch for loading state changes and emit them
watchEffect(() => {
  emit('update:loading', isLoading.value)
})

// Helper function to get status color
function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    processed: 'success',
    pending: 'warning',
    cancelled: 'error',
  }
  return statusColors[status] || 'grey'
}

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
.transaction-item {
  transition: background-color 0.2s ease;
}

.transaction-item:hover {
  background-color: rgb(var(--v-theme-primary), 0.05) !important;
}

.transaction-details {
  border-radius: 8px;
}

.sentinel-element {
  min-height: 10px;
}

@media (max-width: 600px) {
  .transaction-details > div {
    margin-bottom: 16px;
  }
}
</style>
