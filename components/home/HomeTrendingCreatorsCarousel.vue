<template>
  <div class="suggested-talents">
    <BaseHeader title="Trending Creators"> </BaseHeader>
    <TrendingCreatorsCarousel
      :talents="talents"
      :loading="isLoading"
      :loadingMore="isLoadingMore"
      :error="error"
      title="Trending Talents"
      :showHeader="true"
      :autoplay="true"
      cardSize="xlarge"
      @reachEnd="handleReachEnd"
      @talentClick="navigateToTalent"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNuxtApp } from '#app'
import debounce from 'lodash/debounce'

// Nuxt app utilities
const nuxtApp = useNuxtApp()
const router = useRouter()

// Refs for state management
const talents = ref([])
const error = ref(null)
const isLoading = ref(false)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const hasReachedEnd = ref(false)

// Cache for API responses to avoid duplicate requests
const responseCache = ref(new Map())

// Computed property to check if we can load more
const canLoadMore = computed(() => {
  return (
    currentPage.value < lastPage.value &&
    !isLoadingMore.value &&
    !hasReachedEnd.value
  )
})

// Fetch talents from the API with caching
const fetchTalents = async (page = 1, forceRefresh = false) => {
  // Check if API is available
  if (!nuxtApp.$api) {
    console.warn('API plugin not available - skipping fetch')
    error.value = 'API not available'
    isLoading.value = false
    return
  }

  // Check if we already have the data in cache and it's not a forced refresh
  if (!forceRefresh && responseCache.value.has(page)) {
    if (page === 1) {
      talents.value = responseCache.value.get(page).data
    } else {
      talents.value = [...talents.value, ...responseCache.value.get(page).data]
    }
    lastPage.value = responseCache.value.get(page).meta.last_page
    currentPage.value = page
    return
  }

  try {
    isLoading.value = page === 1
    isLoadingMore.value = page > 1
    error.value = null

    const response = await nuxtApp.$api.get(`/api/trending/creators`, {
      params: { page }
    })

    // Cache the response
    responseCache.value.set(page, {
      data: response.data,
      meta: response.meta,
    })

    if (page === 1) {
      talents.value = response.data
    } else {
      // Filter out duplicates when appending new data
      const existingIds = new Set(talents.value.map((talent) => talent.id))
      const newTalents = response.data.filter(
        (talent) => !existingIds.has(talent.id)
      )
      talents.value = [...talents.value, ...newTalents]
    }

    lastPage.value = response.meta.last_page || 1
    currentPage.value = page

    // Check if we've reached the end
    hasReachedEnd.value = page >= lastPage.value
  } catch (err) {
    console.error('Error fetching talents:', err)
    error.value = 'Unable to load talents. Please try again later.'
    if (page === 1) talents.value = []
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

// Handle reaching the end of the carousel
const handleReachEnd = debounce(() => {
  if (canLoadMore.value) {
    fetchTalents(currentPage.value + 1)
  }
}, 200)

// Navigate to talent profile
const navigateToTalent = (talent) => {
  router.push(`/${talent.username}`)
}

// Reset and refresh data
const refreshData = () => {
  currentPage.value = 1
  hasReachedEnd.value = false
  fetchTalents(1, true)
}

// Fetch initial talents on mount - only on client side
onMounted(() => {
  if (process.client) {
    fetchTalents()
  }
})

onUnmounted(() => {
  // Clear any pending async operations if needed
})

// Expose methods for parent components
defineExpose({
  refreshData,
  loadMoreTalents: handleReachEnd,
})
</script>

<style scoped>
.suggested-talents {
  margin-bottom: 2rem;
}
</style>
