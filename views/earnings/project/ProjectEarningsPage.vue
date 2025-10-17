<template>
  <v-container>
    <!-- Page Header -->
    <ProjectPageHeader
      :project="project"
      :loading="isProjectLoading"
      subtitle="Earnings & Revenue Analytics"
    >
      <!-- Custom Actions -->
      <template #actions>
        <v-btn
          icon="mdi-refresh"
          variant="text"
          size="small"
          :loading="isLoading"
          @click="refresh"
        />
      </template>

      <!-- Optional Bottom Content -->
      <template #bottom>
        <v-divider class="mt-4" />
      </template>
    </ProjectPageHeader>

    <!-- Summary Cards -->
    <InvestmentEarningsSummaryCards
      v-if="statistics"
      :summary="statistics.summary"
      class="mb-5"
    />

    <!-- Earnings List wrapped in BaseContent -->
    <BaseContent title="Earnings History">
      <template #content>
        <div class="earnings-list">
          <!-- Earnings List -->
          <template v-if="items.length">
            <ProjectEarningListItem
              v-for="earning in items"
              :key="earning.id"
              :earning="earning"
            />
          </template>

          <!-- Skeleton Loaders -->
          <template v-if="isLoading && !items.length">
            <div v-for="n in 5" :key="n" class="earning-item">
              <v-list-item>
                <template #prepend>
                  <v-skeleton-loader type="avatar" width="40" height="40" />
                </template>
                <div class="d-flex flex-column" style="gap: 4px; flex: 1">
                  <v-skeleton-loader type="text" width="150" />
                  <v-skeleton-loader type="text" width="100" />
                </div>
                <template #append>
                  <div class="text-right">
                    <v-skeleton-loader type="text" width="80" />
                    <v-skeleton-loader type="text" width="60" />
                  </div>
                </template>
              </v-list-item>
              <v-divider />
            </div>
          </template>

          <!-- Empty state -->
          <v-alert
            v-if="!isLoading && !error && items.length === 0"
            type="info"
            class="ma-4"
          >
            No earnings found
          </v-alert>

          <!-- Error state -->
          <v-alert v-if="error" type="error" class="ma-4">
            {{ error }}
          </v-alert>

          <!-- Loader at the bottom -->
          <div v-if="isLoading && items.length > 0" class="earning-item">
            <v-list-item>
              <template #prepend>
                <v-skeleton-loader type="avatar" width="40" height="40" />
              </template>
              <div class="d-flex flex-column" style="gap: 4px; flex: 1">
                <v-skeleton-loader type="text" width="150" />
                <v-skeleton-loader type="text" width="100" />
              </div>
              <template #append>
                <div class="text-right">
                  <v-skeleton-loader type="text" width="80" />
                  <v-skeleton-loader type="text" width="60" />
                </div>
              </template>
            </v-list-item>
            <v-divider />
          </div>

          <!-- End of List State -->
          <v-alert
            v-if="!isLoading && !hasMore && items.length > 0"
            type="info"
            class="ma-4"
          >
            You've reached the end of the list
          </v-alert>
        </div>
      </template>
    </BaseContent>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed, type Ref } from 'vue'
import { useNuxtApp } from '#app'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

// Type Definitions
interface Currency {
  id: number
  name: string
  symbol: string
  code: string
}

interface ProjectUser {
  id: number
  username: string
  display_name: string
  profile_photo: string
}

interface Summary {
  project_total_earnings: string
  creator_total_earnings: string
  investors_total_earnings: string
  total_transactions: number
  total_fees: string
  project_investors: number
  currency: Currency
}

interface MonthlyTrend {
  month: string
  total_amount: number
  viewer_count: number
  currency: Currency
}

interface Statistics {
  summary: Summary
  monthly_trend: MonthlyTrend[]
  last_updated: string
}

interface ProjectEarning {
  id: number
  type: 'project_watching' | 'project_tip'
  amount: number
  net_amount: number
  currency: Currency
  user: ProjectUser
  payment_reference: string | null
  created_at: string
}

interface InfiniteScrollReturn<T> {
  items: Ref<T[]>
  isLoading: Ref<boolean>
  error: Ref<string | null>
  hasMore: Ref<boolean>
  refresh: () => Promise<void>
}

// Props
const props = defineProps({
  project: {
    type: Object,
    required: true,
  },
  accessUuid: {
    type: String,
    required: true,
  },
  isProjectLoading: {
    type: Boolean,
    default: false,
  },
})

// Emits
const emit = defineEmits(['refresh-project'])

// State & Composables
const statistics = ref<Statistics | null>(null)
const { $axios } = useNuxtApp()

// Helper Functions
const capitalizeFirst = (str?: string): string => {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// Currency formatter from a custom composable
const { currencyFormatter } = useCurrencyFormatter()
const formatAmount = (amount: number, currency: Currency): string => {
  return currencyFormatter(amount, currency.symbol, currency.code)
}

// API Calls
const fetchStatistics = async (): Promise<void> => {
  try {
    const { data } = await $axios.get<Statistics>(
      `/api/projects/${props.accessUuid}/earnings/statistics`
    )
    statistics.value = data
  } catch (err: unknown) {
    console.error(
      'Error fetching statistics:',
      err instanceof Error ? err.message : 'Unknown error'
    )
  }
}

const fetchEarnings = async (page: number): Promise<ProjectEarning[]> => {
  const { data } = await $axios.get<{ data: ProjectEarning[] }>(
    `/api/projects/${props.accessUuid}/earnings`,
    { params: { page } }
  )
  return data.data
}

// Infinite Scroll Setup
const {
  items,
  isLoading,
  error,
  hasMore,
  refresh,
}: InfiniteScrollReturn<ProjectEarning> = useInfiniteScroll<ProjectEarning>(
  fetchEarnings,
  {
    threshold: 200,
    throttle: 300,
  }
)

// Data Management
const initializeData = async (): Promise<void> => {
  await Promise.all([fetchStatistics()])
}

const refreshData = async (): Promise<void> => {
  await Promise.all([fetchStatistics(), refresh(), emit('refresh-project')])
}

const startAutoRefresh = (): void => {
  const refreshInterval: number = 5 * 60 * 1000 // 5 minutes
  const interval: number = setInterval(() => {
    refreshData()
  }, refreshInterval)
  onUnmounted(() => clearInterval(interval))
}

// Lifecycle Hooks
onMounted(() => {
  initializeData()
  startAutoRefresh()
})

// Watch for accessUuid changes
watch(
  () => props.accessUuid,
  (newId: string) => {
    if (newId) {
      initializeData()
    }
  }
)
</script>

<style scoped>
.earnings-list {
  max-height: 600px;
  overflow-y: auto;
}

.earning-item {
  transition: background-color 0.2s;
}

.earning-item:hover {
  background-color: rgba(0, 0, 0, 0.03);
}

.status-chip {
  font-size: 0.75rem;
  height: 24px;
}

:deep(.v-skeleton-loader) {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
  100% {
    opacity: 1;
  }
}
</style>
