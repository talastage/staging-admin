<template>
  <BaseCard>
    <BaseHeader
      title="My Investments"
      subtitle="Projects you have invested into"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-refresh"
          :loading="isRefreshing"
          @click="refreshInfinite"
          size="small"
        >
          Refresh
        </v-btn>
      </template>
    </BaseHeader>

    <div class="investments-container">
      <!-- Initial loading skeleton -->
      <v-progress-linear
        v-if="isLoading && firstLoad"
        indeterminate
        class="mb-4"
      />

      <!-- Render items if available -->
      <template v-if="items.length">
        <div class="investments-grid">
          <UserInvestmentCard
            v-for="item in items"
            :key="item.id"
            :investment="item"
            @openApproveDialog="openApproveDialog"
          />
        </div>

        <!-- Infinite scroll loading indicator -->
        <div v-if="isLoading && !firstLoad" class="text-center py-4">
          <v-progress-circular indeterminate size="24" />
        </div>

        <!-- Message when no more data -->
        <div v-if="!hasMore" class="text-center py-4 text-body-2 text-medium-emphasis">
          No more investments to load
        </div>
      </template>

      <!-- Empty state if no items -->
      <EmptyStateCard
        v-else-if="!isLoading"
        title="No Investments"
        message="You haven't made any investments yet."
      />
    </div>

    <!-- Approve/Reject dialog -->
    <ApproveInvestmentDialog
      v-model="showDialog"
      :investment="selectedInvestment"
      @approved="onApproved"
      @rejected="onRejected"
    />
  </BaseCard>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useNuxtApp } from '#app'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

const { $axios } = useNuxtApp()

// Track if this is the first data load
const firstLoad = ref(true)
// Flag to track refresh action
const isRefreshing = ref(false)

// Function to fetch user investments
const fetchUserInvestments = async (page: number) => {
  const response = await $axios.get('/api/user/investments', {
    params: { page },
  })

  // On the first page load, mark firstLoad as false
  if (page === 1) {
    firstLoad.value = false
  }

  // Return the investments array
  return response.data.data
}

// Use the infinite scroll composable with our fetch function
const { items, isLoading, error, hasMore, refresh, reset } = useInfiniteScroll(
  fetchUserInvestments,
  { threshold: 100, throttle: 200 }
)

// Refresh function for infinite scroll
const refreshInfinite = async () => {
  isRefreshing.value = true
  reset() // Reset infinite scroll state
  await refresh()
  isRefreshing.value = false
}

// Approve/Reject investment logic
const showDialog = ref(false)
const selectedInvestment = ref<any>(null)

const openApproveDialog = (investment: any) => {
  selectedInvestment.value = investment
  showDialog.value = true
}

const onApproved = async (projectInvestorId: number) => {
  await $axios.post(`/api/user/investments/${projectInvestorId}/approve`)
  await refreshInfinite()
}

const onRejected = async (projectInvestorId: number, notes: string) => {
  await $axios.post(`/api/user/investments/${projectInvestorId}/reject`, {
    message: notes,
  })
  await refreshInfinite()
}
</script>

<style scoped>
.investments-container {
  max-width: 100%;
}

.investments-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 600px) {
  .investments-grid {
    gap: 12px;
  }
}
</style>
