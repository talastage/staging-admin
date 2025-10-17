<template>
  <v-container fluid>
    <BaseHeader
      title="Page Investments"
      subtitle="Projects this page has invested into"
    >
      <template #actions>
        <v-btn
          color="primary"
          variant="text"
          prepend-icon="mdi-refresh"
          :loading="isRefreshing"
          @click="refreshInfinite"
        >
          Refresh
        </v-btn>
      </template>
    </BaseHeader>

    <!-- Initial loading skeleton -->
    <v-progress-linear
      v-if="isLoading && firstLoad"
      indeterminate
      class="my-4"
    />

    <!-- Render items if available -->
    <template v-if="items.length">
      <v-row>
        <v-col cols="12" v-for="item in items" :key="item.id">
          <!-- If creator, show full investment details; otherwise, show a compact project card -->
          <PageInvestmentCard
            v-if="isCreator"
            :investment="item"
            @openApproveDialog="openApproveDialog"
          />
          <ProjectCardCompact v-else :project="item" />
        </v-col>
      </v-row>

      <!-- Infinite scroll loading indicator -->
      <v-progress-circular
        v-if="isLoading && !firstLoad"
        indeterminate
        class="my-4"
      />

      <!-- Message when no more data -->
      <div v-if="!hasMore" class="text-center my-4">
        <span>No more data.</span>
      </div>
    </template>

    <!-- Empty state if no items -->
    <v-alert v-else-if="!isLoading" type="info">
      No investments found.
    </v-alert>

    <!-- Approve/Reject dialog -->
    <ApproveInvestmentDialog
      v-model="showDialog"
      :investment="selectedInvestment"
      @approved="onApproved"
      @rejected="onRejected"
    />
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNuxtApp } from '#app'
import { useInfiniteScroll } from '~/composables/useInfiniteScroll'

const route = useRoute()
const { $axios } = useNuxtApp()
const pageSlug = route.params.pageSlug as string

// Flag indicating whether the logged-in user is the page creator.
const isCreator = ref(false)
// Track if this is the first data load.
const firstLoad = ref(true)
// Flag to track refresh action.
const isRefreshing = ref(false)

// Function to fetch investments or projects for the given page.
const fetchInvestments = async (page: number) => {
  const response = await $axios.get(`/api/pages/investments/${pageSlug}`, {
    params: { page },
  })
  // On the first page load, set the creator flag and mark firstLoad as false.
  if (page === 1) {
    isCreator.value = response.data.is_creator
    firstLoad.value = false
  }
  // Return the investments (or projects) array.
  return response.data.data
}

// Use the infinite scroll composable with our fetch function.
const { items, isLoading, error, hasMore, refresh, reset } = useInfiniteScroll(
  fetchInvestments,
  { threshold: 100, throttle: 200 }
)

// Refresh function for infinite scroll.
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
  await $axios.post(
    `/api/pages/investments/${pageSlug}/${projectInvestorId}/approve`
  )
  await refreshInfinite()
}

const onRejected = async (projectInvestorId: number, notes: string) => {
  await $axios.post(
    `/api/pages/investments/${pageSlug}/${projectInvestorId}/reject`,
    {
      message: notes,
    }
  )
  await refreshInfinite()
}
</script>

<style scoped>
.text-center {
  text-align: center;
}
.my-4 {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
</style>
