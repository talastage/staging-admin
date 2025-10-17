<template>
  <v-container class="upcoming-premieres-container">
    <!-- Page Header -->
    <BaseHeader
      title="Upcoming Premieres"
      subtitle="Discover exclusive first-releases and upcoming content from creators"
    />

    <!-- Projects Grid -->
    <ProjectUpcomingGrid
      :premieres="premieres"
      :current-page="currentPage"
      :last-page="lastPage"
      :is-loading="isLoading"
    >
    </ProjectUpcomingGrid>

    <!-- Sentinel for infinite scrolling -->
    <div ref="sentinelRef" class="infinite-sentinel" />

    <!-- End of Content Message -->
    <div
      v-if="!isLoading && premieres.length > 0 && !hasMore"
      class="mt-4 mb-6"
    >
      <v-alert type="info" variant="tonal" class="text-center">
        No more upcoming premieres
      </v-alert>
    </div>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUpcomingPremieres } from '~/composables/useUpcomingPremieres'
import { useInfiniteLoader } from '~/composables/useInfiniteLoader'
import type { UpcomingPremiere } from '@/types/premiere'

// Set up router and API fetch function
const router = useRouter()
const { fetchUpcomingPremieres } = useUpcomingPremieres()

// Reactive state for premieres and pagination
const premieres = ref<UpcomingPremiere[]>([])
const currentPage = ref(1)
const lastPage = ref(1)
const hasMore = ref(true)

// This function fetches a page of premieres and merges the results.
async function fetchPage(page: number): Promise<void> {
  // Reset items if fetching the first page
  if (page === 1) {
    premieres.value = []
  }
  try {
    const response = await fetchUpcomingPremieres(page)
    premieres.value.push(...response.data)
    currentPage.value = response.meta.current_page
    lastPage.value = response.meta.last_page
    // If the current page is the last page, set hasMore to false.
    hasMore.value = response.meta.current_page < response.meta.last_page
  } catch (error) {
    console.error('Error fetching page:', page, error)
  }
}

// Use the infinite loader composable which will automatically load data
// on mount (because immediate is true) and when the sentinel enters the viewport.
const { sentinelRef, isLoading, loadNextPage, initLoader } = useInfiniteLoader(
  fetchPage,
  hasMore,
  { immediate: true }
)

// Optionally, you can expose a manual loadMore function.
const loadMore = () => {
  if (!isLoading.value && hasMore.value) {
    loadNextPage()
  }
}

// Navigate to the explore page.
const goToExplore = (): void => {
  router.push('/explore/projects')
}
</script>

<style scoped>
.upcoming-premieres-container {
  width: 100%;
  max-width: none;
}

.infinite-sentinel {
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
