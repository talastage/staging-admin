<!-- views/payments/UserPaymentsPage.vue -->
<template>
  <div class="user-payments">
    <BaseContent
      title="Payment History"
      subtitle="View and manage your payment transactions"
    >
      <template #action>
        <div class="filter-controls">
          <v-select
            v-model="filterStatus"
            :items="statusOptions"
            label="Filter by Status"
            variant="outlined"
            density="comfortable"
            hide-details
            prepend-inner-icon="mdi-filter-variant"
            class="filter-select"
            :class="{ 'filter-select-mobile': mobile }"
          ></v-select>
        </div>
      </template>

      <template #content>
        <!-- Loading Skeleton -->
        <template v-if="loading && !payments.length">
          <div class="skeleton-container">
            <PaymentListSkeleton v-for="n in 3" :key="n" />
          </div>
        </template>

        <!-- Payments List with infinite scrolling -->
        <template v-else-if="payments.length">
          <div class="payments-container">
            <PaymentList :payments="payments" :loading="loading" />

            <!-- Infinite Scroll Sentinel -->
            <div ref="sentinelRef" class="d-flex justify-center my-6">
              <template v-if="loading">
                <div class="loading-more">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="28"
                    width="3"
                  />
                  <span class="text-body-2 text-medium-emphasis ml-3">
                    Loading more payments...
                  </span>
                </div>
              </template>
              <template v-else-if="!hasMore">
                <v-chip
                  variant="tonal"
                  color="primary"
                  prepend-icon="mdi-check-circle"
                  class="end-message"
                >
                  All payments loaded
                </v-chip>
              </template>
            </div>
          </div>
        </template>

        <!-- Empty State -->
        <div v-else class="empty-state-container">
          <EmptyStateCard
            title="No Payments Found"
            message="You haven't made any payments yet. Your payment history will appear here once you start making transactions."
            icon="mdi-credit-card-outline"
            icon-color="primary"
          >
            <v-btn
              color="primary"
              variant="elevated"
              prepend-icon="mdi-plus"
              @click="$router.push('/premieres')"
            >
              Explore Premieres
            </v-btn>
          </EmptyStateCard>
        </div>

        <!-- Error State -->
        <v-alert
          v-if="error"
          type="error"
          variant="tonal"
          class="mt-4 error-alert"
          closable
          @click:close="error = null"
        >
          <template #prepend>
            <v-icon icon="mdi-alert-circle" />
          </template>
          <div class="d-flex flex-column">
            <strong>Error Loading Payments</strong>
            <span class="text-body-2 mt-1">{{ error }}</span>
          </div>
          <template #append>
            <v-btn variant="text" size="small" @click="retryLoad">
              Retry
            </v-btn>
          </template>
        </v-alert>
      </template>
    </BaseContent>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserPayments } from '~/composables/useUserPayments'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'
import { useDisplay } from 'vuetify'

// Responsive display
const { mobile, smAndDown, mdAndDown } = useDisplay()

// Filter state
const filterStatus = ref('all')
const statusOptions = [
  { title: 'All Statuses', value: 'all' },
  { title: 'Completed', value: 'completed' },
  { title: 'Pending', value: 'pending' },
  { title: 'Failed', value: 'failed' },
]

// Use our composable for payment data
const { payments, loading, error, hasMore, fetchPayments } = useUserPayments()

// Setup infinite loader
const { sentinelRef, initLoader } = useInfiniteLoader(fetchPayments, hasMore, {
  immediate: true,
})

// Retry function for error state
const retryLoad = () => {
  error.value = null
  payments.value = []
  initLoader()
}

// Watch for filter changes
watch(filterStatus, () => {
  // Reset and reload with new filter
  payments.value = []
  initLoader()
})
</script>

<style scoped>
.user-payments {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-controls {
  display: flex;
  gap: 12px;
  align-items: center;
}

.filter-select {
  min-width: 200px;
  max-width: 250px;
}

.filter-select-mobile {
  min-width: 160px;
  max-width: 180px;
}

.skeleton-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.payments-container {
  min-height: 200px;
}

.loading-more {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  border-radius: 24px;
  background: rgba(var(--v-theme-surface-variant), 0.1);
}

.end-message {
  font-weight: 500;
}

.empty-state-container {
  padding: 2rem 0;
}

.error-alert {
  border-left: 4px solid rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.05);
}

/* Enhanced responsive styles */
@media (max-width: 960px) {
  .filter-select {
    min-width: 180px;
    max-width: 200px;
  }
}

@media (max-width: 600px) {
  .filter-controls {
    width: 100%;
    justify-content: stretch;
  }

  .filter-select,
  .filter-select-mobile {
    min-width: auto;
    max-width: none;
    width: 100%;
  }

  .loading-more {
    padding: 8px 16px;
    border-radius: 16px;
  }

  .loading-more span {
    font-size: 0.875rem;
  }
}

/* Dark mode enhancements */
.v-theme--dark .loading-more {
  background: rgba(var(--v-theme-surface-variant), 0.15);
}

.v-theme--dark .error-alert {
  background: rgba(var(--v-theme-error), 0.08);
}

/* Smooth transitions */
.payments-container,
.skeleton-container,
.empty-state-container {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

/* Loading state animation */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.payments-container {
  animation: fadeInUp 0.4s ease-out;
}
</style>
