<!-- components/home/HomeProjectInvestorsCarousel.vue -->
<template>
  <div class="investors-carousel-section">
    <BaseHeader
      title="Featured Investors"
      subtitle="Connect with verified investors ready to fund your creative projects including movies, music videos, and more"
    >
      <template #actionable>
        <ViewAllButton
          route="/investors"
          label="Find Investor"
          prependIcon="mdi-magnify"
          color="primary"
        />
      </template>
    </BaseHeader>

    <InvestorsCarousel
      :investors="investors"
      :loading="isLoading"
      :loadingMore="isLoadingMore"
      :error="error"
      :autoplay="false"
      @reachEnd="handleReachEnd"
      @investorClick="navigateToInvestor"
    />

    <v-alert
      v-if="!isLoading && !isLoadingMore && investors.length === 0 && !error"
      type="info"
      text
      class="text-center my-4"
    >
      No investors available at the moment
    </v-alert>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import debounce from 'lodash/debounce'
import InvestorsCarousel from '~/components/carousel/InvestorsCarousel.vue'

// --- Emits ---
const emit = defineEmits(['has-data', 'loading'])

// --- Constants ---
const CATEGORY_SLUG = 'investor'
const PER_PAGE = 8

// --- Setup ---
const { $axios } = useNuxtApp()
const router = useRouter()
const { smAndDown } = useDisplay()

// --- State ---
const investors = ref([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const currentPage = ref(1)
const lastPage = ref(1)
const error = ref(null)
const responseCache = ref(new Map())

// --- Computed ---
const canLoadMore = computed(() => {
  return currentPage.value < lastPage.value && !isLoadingMore.value
})

// --- Methods ---
const fetchInvestors = async (page = 1, forceRefresh = false) => {
  // Check cache first
  if (!forceRefresh && responseCache.value.has(page)) {
    if (page === 1) {
      investors.value = responseCache.value.get(page).data
    } else {
      investors.value = [
        ...investors.value,
        ...responseCache.value.get(page).data,
      ]
    }
    lastPage.value = responseCache.value.get(page).meta.last_page
    currentPage.value = page
    return
  }

  try {
    isLoading.value = page === 1
    isLoadingMore.value = page > 1
    error.value = null

    const params = {
      page,
      per_page: PER_PAGE,
      status: 'active',
    }

    const response = await $axios.get(`/api/pages/category/${CATEGORY_SLUG}`, {
      params,
    })

    // Cache the response
    responseCache.value.set(page, {
      data: response.data.data,
      meta: response.data.meta,
    })

    if (page === 1) {
      investors.value = response.data.data
    } else {
      // Filter out duplicates when appending new data
      const existingIds = new Set(investors.value.map((inv) => inv.id))
      const newInvestors = response.data.data.filter(
        (inv) => !existingIds.has(inv.id)
      )
      investors.value = [...investors.value, ...newInvestors]
    }

    lastPage.value = response.data.meta.last_page || 1
    currentPage.value = page
  } catch (err) {
    console.error('Error fetching investors:', err)
    error.value = 'Unable to load investors. Please try again later.'
    if (page === 1) investors.value = []
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
    
    // Emit loading state and data availability
    emit('loading', isLoading.value || isLoadingMore.value)
    emit('has-data', investors.value.length > 0)
  }
}

// Handle reaching the end of the carousel
const handleReachEnd = debounce(() => {
  if (canLoadMore.value) {
    fetchInvestors(currentPage.value + 1)
  }
}, 200)

// Navigate to investor profile
const navigateToInvestor = (investor) => {
  router.push(`/profile/${investor.type}/${investor.slug}`)
}

// Reset and refresh data
const refreshData = () => {
  currentPage.value = 1
  fetchInvestors(1, true)
}

// --- Watchers ---
watch([isLoading, isLoadingMore], ([loading, loadingMore]) => {
  emit('loading', loading || loadingMore)
})

watch(investors, (newInvestors) => {
  emit('has-data', newInvestors.length > 0)
}, { immediate: true })

// --- Lifecycle ---
onMounted(() => {
  fetchInvestors()
})

// --- Expose methods ---
defineExpose({
  refreshData,
})
</script>

<style scoped>
.investors-carousel-section {
  margin-bottom: 2rem;
}

@media (min-width: 600px) {
  .investors-carousel-section {
    margin-bottom: 3rem;
  }
}
</style>
